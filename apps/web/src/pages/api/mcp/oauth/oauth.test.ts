/** @jest-environment node */
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import handler from './[action]'
import connections from '@/pages/api/me/mcp-connections'
import { createConsent, hash } from '@/libs/mcp/oauth'

jest.mock('next-auth/next', () => ({ getServerSession: jest.fn() }))
jest.mock('@/pages/api/auth/[...nextauth]', () => ({ authOptions: {} }))
jest.mock('@/libs/prisma', () => ({
  __esModule: true,
  default: {
    mcpClient: { create: jest.fn(), deleteMany: jest.fn() },
    mcpGrant: { create: jest.fn(), deleteMany: jest.fn(), findMany: jest.fn() },
  },
}))
const prisma = jest.requireMock('@/libs/prisma').default
const session = getServerSession as jest.Mock
function response() {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    end: jest.fn(),
    redirect: jest.fn(),
    setHeader: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res as unknown as NextApiResponse & typeof res
}
function request(action: string, body: unknown = {}, method = 'POST') {
  return {
    method,
    headers: {},
    query: { action },
    body,
  } as unknown as NextApiRequest
}
const auth = {
  clientId: 'client-1',
  clientName: 'Test app',
  redirectUri: 'https://client.example/callback',
  codeChallenge: 'a'.repeat(43),
  resource: 'https://kidoku.example/api/mcp',
  state: 'state-1',
}

beforeEach(() => {
  jest.clearAllMocks()
  process.env.NEXTAUTH_URL = 'https://kidoku.example'
  process.env.NEXTAUTH_SECRET = 'test-secret'
  session.mockResolvedValue({ user: { id: 'user-1' } })
})

test('publishes discoverable OAuth endpoints and protected resource metadata', async () => {
  const metadata = response()
  await handler(request('metadata', {}, 'GET'), metadata)
  expect(metadata.json).toHaveBeenCalledWith(
    expect.objectContaining({
      issuer: 'https://kidoku.example',
      authorization_endpoint: 'https://kidoku.example/mcp/authorize',
      code_challenge_methods_supported: ['S256'],
      client_id_metadata_document_supported: true,
      authorization_response_iss_parameter_supported: true,
    })
  )
  const resource = response()
  await handler(request('resource', {}, 'GET'), resource)
  expect(resource.json).toHaveBeenCalledWith(
    expect.objectContaining({
      resource: auth.resource,
      authorization_servers: ['https://kidoku.example'],
    })
  )
})

test('registers public clients and rejects unsafe redirect metadata', async () => {
  prisma.mcpGrant.findMany.mockResolvedValue([])
  prisma.mcpClient.create.mockResolvedValue({ id: 'client-1', name: 'Test' })
  const res = response()
  await handler(
    request('register', {
      client_name: 'Test',
      redirect_uris: [auth.redirectUri],
      token_endpoint_auth_method: 'none',
    }),
    res
  )
  expect(res.status).toHaveBeenCalledWith(201)
  expect(prisma.mcpClient.deleteMany).toHaveBeenCalled()
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      client_id: 'client-1',
      redirect_uris: [auth.redirectUri],
    })
  )
  prisma.mcpClient.create.mockClear()
  for (const body of [
    { redirect_uris: ['javascript:alert(1)'] },
    {
      redirect_uris: [auth.redirectUri],
      token_endpoint_auth_method: 'client_secret_post',
    },
    { redirect_uris: [auth.redirectUri], grant_types: ['password'] },
  ]) {
    const bad = response()
    await handler(request('register', body), bad)
    expect(bad.status).toHaveBeenCalledWith(400)
  }
  expect(prisma.mcpClient.create).not.toHaveBeenCalled()
})

test('only issues authorization codes after authenticated, untampered consent', async () => {
  const consent = createConsent('user-1', auth)
  const res = response()
  await handler(request('authorize', { consent, decision: 'allow' }), res)
  const redirect = new URL(res.redirect.mock.calls[0][1])
  expect(redirect.origin).toBe('https://client.example')
  expect(redirect.searchParams.get('state')).toBe('state-1')
  expect(redirect.searchParams.get('iss')).toBe('https://kidoku.example')
  expect(prisma.mcpGrant.create).toHaveBeenCalledWith({
    data: expect.objectContaining({
      userId: 'user-1',
      clientName: 'Test app',
      codeHash: hash(redirect.searchParams.get('code')),
    }),
  })
  prisma.mcpGrant.create.mockClear()
  session.mockResolvedValue({ user: { id: 'user-2' } })
  const other = response()
  await handler(request('authorize', { consent, decision: 'allow' }), other)
  expect(other.status).toHaveBeenCalledWith(400)
  expect(other.redirect).not.toHaveBeenCalled()
  session.mockResolvedValue(null)
  const unauthenticated = response()
  await handler(
    request('authorize', { consent, decision: 'allow' }),
    unauthenticated
  )
  expect(unauthenticated.status).toHaveBeenCalledWith(401)
  expect(prisma.mcpGrant.create).not.toHaveBeenCalled()
})

test('denied consent returns state and access_denied, without issuing a code', async () => {
  const res = response()
  await handler(
    request('authorize', {
      consent: createConsent('user-1', auth),
      decision: 'deny',
    }),
    res
  )
  const redirect = new URL(res.redirect.mock.calls[0][1])
  expect(redirect.searchParams.get('error')).toBe('access_denied')
  expect(redirect.searchParams.get('state')).toBe('state-1')
  expect(prisma.mcpGrant.create).not.toHaveBeenCalled()
})

test('OAuth revocation is bound to both client and possession of the token', async () => {
  const res = response()
  await handler(
    request('revoke', { client_id: 'client-1', token: 'token-1' }),
    res
  )
  expect(prisma.mcpGrant.deleteMany).toHaveBeenCalledWith({
    where: {
      clientId: 'client-1',
      OR: [{ tokenHash: hash('token-1') }, { refreshHash: hash('token-1') }],
    },
  })
  expect(res.status).toHaveBeenCalledWith(200)
})

test('settings can only revoke the signed-in user grants from the same origin', async () => {
  const req = request('unused', {}, 'DELETE')
  req.query = { id: 'grant-1' }
  req.headers.origin = 'https://evil.example'
  const forbidden = response()
  await connections(req, forbidden)
  expect(forbidden.status).toHaveBeenCalledWith(403)
  expect(prisma.mcpGrant.deleteMany).not.toHaveBeenCalled()
  req.headers.origin = 'https://kidoku.example'
  const res = response()
  await connections(req, res)
  expect(prisma.mcpGrant.deleteMany).toHaveBeenCalledWith({
    where: { id: 'grant-1', userId: 'user-1' },
  })
})
