/** @jest-environment node */
import { createHash } from 'crypto'
import type { NextApiRequest } from 'next'
import {
  authenticateMcp,
  createAuthorizationCode,
  createConsent,
  exchangeToken,
  hash,
  mcpUrls,
  readConsent,
  validateAuthorization,
  validRedirectUri,
} from './oauth'

jest.mock('@/libs/prisma', () => ({
  __esModule: true,
  default: {
    mcpClient: { findUnique: jest.fn() },
    mcpGrant: {
      create: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}))
const prisma = jest.requireMock('@/libs/prisma').default
const authorization = {
  clientId: 'client-1',
  redirectUri: 'https://client.example/callback',
  codeChallenge: 'a'.repeat(43),
  resource: 'https://kidoku.example/api/mcp',
  state: 'client-state',
}

beforeEach(() => {
  jest.clearAllMocks()
  process.env.NEXTAUTH_URL = 'https://kidoku.example'
  process.env.NEXTAUTH_SECRET = 'test-secret'
})

test('uses configured origin, rejecting non-HTTPS production URLs', () => {
  expect(mcpUrls().resource).toBe(authorization.resource)
  process.env.NEXTAUTH_URL = 'http://kidoku.example'
  expect(() => mcpUrls()).toThrow('HTTPS')
})

test.each([
  'javascript:alert(1)',
  'https://user:pass@client.example/cb',
  'https://client.example/cb#fragment',
  'http://client.example/cb',
])('rejects unsafe redirect %s', (uri) =>
  expect(validRedirectUri(uri)).toBe(false)
)

test('accepts HTTPS and loopback redirects', () => {
  expect(validRedirectUri(authorization.redirectUri)).toBe(true)
  expect(validRedirectUri('http://127.0.0.1:9000/callback')).toBe(true)
})

test('requires exact registered redirect, PKCE S256, resource and scope', async () => {
  prisma.mcpClient.findUnique.mockResolvedValue({
    name: 'Test app',
    redirectUris: [authorization.redirectUri],
  })
  const params = new URLSearchParams({
    client_id: 'client-1',
    redirect_uri: authorization.redirectUri,
    response_type: 'code',
    code_challenge: authorization.codeChallenge,
    code_challenge_method: 'S256',
    resource: authorization.resource,
    scope: 'books:read',
    state: 'client-state',
  })
  await expect(validateAuthorization(params)).resolves.toEqual({
    clientName: 'Test app',
    authorization,
  })
  for (const [key, value] of [
    ['redirect_uri', 'https://evil.example'],
    ['code_challenge_method', 'plain'],
    ['resource', 'https://other.example/api/mcp'],
    ['scope', 'books:write'],
  ]) {
    const bad = new URLSearchParams(params)
    bad.set(key, value)
    await expect(validateAuthorization(bad)).rejects.toThrow()
  }
})

test('consent is bound to user, parameters and expiry', () => {
  const token = createConsent('user-1', authorization)
  expect(readConsent(token, 'user-1')).toEqual(authorization)
  expect(() => readConsent(token, 'user-2')).toThrow()
  expect(() => readConsent(`${token}x`, 'user-1')).toThrow()
  jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 600001)
  expect(() => readConsent(token, 'user-1')).toThrow()
  jest.restoreAllMocks()
})

test('stores only the hash of an authorization code', async () => {
  const code = await createAuthorizationCode('user-1', authorization)
  expect(prisma.mcpGrant.create).toHaveBeenCalledWith({
    data: expect.objectContaining({
      userId: 'user-1',
      clientId: 'client-1',
      codeHash: hash(code),
      resource: authorization.resource,
    }),
  })
  expect(JSON.stringify(prisma.mcpGrant.create.mock.calls)).not.toContain(
    `"${code}"`
  )
})

test('atomically consumes a code with PKCE, client, redirect, audience and expiry checks', async () => {
  prisma.mcpGrant.updateMany
    .mockResolvedValueOnce({ count: 1 })
    .mockResolvedValueOnce({ count: 0 })
  const verifier = 'v'.repeat(43)
  const body = {
    grant_type: 'authorization_code',
    client_id: 'client-1',
    code: 'code',
    code_verifier: verifier,
    redirect_uri: authorization.redirectUri,
    resource: authorization.resource,
  }
  const tokens = await exchangeToken(body)
  expect(prisma.mcpGrant.updateMany).toHaveBeenCalledWith({
    where: expect.objectContaining({
      clientId: 'client-1',
      codeHash: hash('code'),
      codeChallengeHash: hash(
        createHash('sha256').update(verifier).digest('base64url')
      ),
      redirectUriHash: hash(authorization.redirectUri),
      resource: authorization.resource,
      codeExpiresAt: { gt: expect.any(Date) },
      expiresAt: { gt: expect.any(Date) },
    }),
    data: expect.objectContaining({
      codeHash: null,
      tokenHash: hash(tokens.access_token),
      refreshHash: hash(tokens.refresh_token),
    }),
  })
  await expect(exchangeToken(body)).rejects.toThrow('認可コード')
})

test('rejects bad PKCE and wrong audience before issuing tokens', async () => {
  await expect(
    exchangeToken({ grant_type: 'authorization_code', code_verifier: 'short' })
  ).rejects.toThrow()
  await expect(
    exchangeToken({ resource: 'https://other.example' })
  ).rejects.toThrow()
  expect(prisma.mcpGrant.updateMany).not.toHaveBeenCalled()
})

test('rotates refresh and access tokens and rejects reuse', async () => {
  prisma.mcpGrant.updateMany
    .mockResolvedValueOnce({ count: 1 })
    .mockResolvedValueOnce({ count: 0 })
  const body = {
    grant_type: 'refresh_token',
    client_id: 'client-1',
    refresh_token: 'refresh',
  }
  const tokens = await exchangeToken(body)
  expect(prisma.mcpGrant.updateMany).toHaveBeenCalledWith({
    where: {
      clientId: 'client-1',
      refreshHash: hash('refresh'),
      resource: authorization.resource,
      expiresAt: { gt: expect.any(Date) },
    },
    data: expect.objectContaining({
      tokenHash: hash(tokens.access_token),
      refreshHash: hash(tokens.refresh_token),
    }),
  })
  await expect(exchangeToken(body)).rejects.toThrow('更新トークン')
})

test('only accepts unexpired tokens for this resource, not PATs or ID tokens', async () => {
  const request = (token: string) =>
    ({ headers: { authorization: `Bearer ${token}` } }) as NextApiRequest
  await expect(
    authenticateMcp(request('kidoku_pat_secret'))
  ).resolves.toBeNull()
  await expect(
    authenticateMcp(request('header.payload.signature'))
  ).resolves.toBeNull()
  prisma.mcpGrant.findUnique.mockResolvedValue({
    userId: 'user-1',
    tokenExpiresAt: new Date(Date.now() + 10000),
    expiresAt: new Date(Date.now() + 20000),
    resource: authorization.resource,
  })
  await expect(authenticateMcp(request('a'.repeat(43)))).resolves.toBe('user-1')
  prisma.mcpGrant.findUnique.mockResolvedValue({
    userId: 'user-1',
    tokenExpiresAt: new Date(0),
    expiresAt: new Date(Date.now() + 20000),
    resource: authorization.resource,
  })
  await expect(authenticateMcp(request('a'.repeat(43)))).resolves.toBeNull()
})
