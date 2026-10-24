import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto'
import type { NextApiRequest } from 'next'
import prisma from '@/libs/prisma'
import { fetchClientMetadata, isClientIdUrl } from './client-metadata'
import { MCP_SCOPE, MCP_ITEMS_SCOPE, MCP_SCOPES } from './scopes'

export { MCP_SCOPE, MCP_ITEMS_SCOPE, MCP_SCOPES } from './scopes'
export const ACCESS_TOKEN_SECONDS = 3600
const GRANT_SECONDS = 30 * 24 * 3600
const UNUSED_CLIENT_SECONDS = 24 * 3600
const LOOPBACK_HOSTS = ['127.0.0.1', '[::1]', 'localhost']
export const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex')
const randomToken = () => randomBytes(32).toString('base64url')

export class OAuthError extends Error {
  constructor(
    public readonly error: string,
    message: string,
    public readonly status = 400
  ) {
    super(message)
  }
}

export function normalizeMcpScope(value: string) {
  const requested = value.split(/\s+/).filter(Boolean)
  if (
    !requested.length ||
    requested.some((scope) => !MCP_SCOPES.includes(scope))
  )
    throw new OAuthError(
      'invalid_scope',
      'books:read または items:read を指定してください'
    )
  return requested.includes(MCP_ITEMS_SCOPE) ? MCP_ITEMS_SCOPE : MCP_SCOPE
}

export function mcpUrls() {
  const url = new URL(process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_HOST)
  if (
    url.protocol !== 'https:' &&
    !(
      url.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
    )
  ) {
    throw new Error(
      'MCP requires an HTTPS public URL (HTTP loopback is allowed)'
    )
  }
  return {
    issuer: url.origin,
    resource: `${url.origin}/api/mcp`,
    resourceMetadata: `${url.origin}/.well-known/oauth-protected-resource/api/mcp`,
  }
}

export function validRedirectUri(value: string) {
  try {
    const url = new URL(value)
    return (
      !url.hash &&
      !url.username &&
      !url.password &&
      (url.protocol === 'https:' ||
        (url.protocol === 'http:' && LOOPBACK_HOSTS.includes(url.hostname)))
    )
  } catch {
    return false
  }
}

// Native apps listen on an ephemeral loopback port, so the port is ignored for loopback URIs (RFC 8252 7.3).
export function redirectUriAllowed(registered: string[], requested: string) {
  if (registered.includes(requested)) return true
  try {
    const url = new URL(requested)
    if (url.protocol !== 'http:' || !LOOPBACK_HOSTS.includes(url.hostname))
      return false
    return registered.some((value) => {
      const candidate = new URL(value)
      return (
        candidate.protocol === 'http:' &&
        candidate.hostname === url.hostname &&
        candidate.pathname === url.pathname &&
        candidate.search === url.search
      )
    })
  } catch {
    return false
  }
}

// A client_id is either an HTTPS metadata document URL or an id issued by dynamic registration.
async function resolveClient(clientId: string) {
  if (isClientIdUrl(clientId)) {
    const metadata = await fetchClientMetadata(
      clientId,
      validRedirectUri
    ).catch(() => {
      throw new OAuthError(
        'invalid_client',
        'クライアント情報を取得できませんでした'
      )
    })
    return { ...metadata, host: new URL(clientId).hostname }
  }
  const client = clientId
    ? await prisma.mcpClient.findUnique({ where: { id: clientId } })
    : null
  if (!client)
    throw new OAuthError('invalid_client', '登録済みのクライアントが必要です')
  return {
    name: client.name,
    redirectUris: client.redirectUris as string[],
    host: null,
  }
}

// Dynamic registration is unauthenticated, so registrations that never led to a connection are removed.
export async function removeUnusedRegistrations(now = new Date()) {
  await prisma.mcpGrant.deleteMany({
    where: {
      OR: [
        { expiresAt: { lte: now } },
        { tokenHash: null, codeExpiresAt: { lte: now } },
      ],
    },
  })
  const active = await prisma.mcpGrant.findMany({
    distinct: ['clientId'],
    select: { clientId: true },
  })
  await prisma.mcpClient.deleteMany({
    where: {
      createdAt: { lt: new Date(now.getTime() - UNUSED_CLIENT_SECONDS * 1000) },
      id: { notIn: active.map((grant) => grant.clientId) },
    },
  })
}

export type Authorization = {
  clientId: string
  clientName: string
  redirectUri: string
  codeChallenge: string
  resource: string
  state?: string
  scope?: string
}

export async function validateAuthorization(params: URLSearchParams) {
  const clientId = params.get('client_id') || ''
  const redirectUri = params.get('redirect_uri') || ''
  const client = await resolveClient(clientId)
  if (!redirectUriAllowed(client.redirectUris, redirectUri)) {
    throw new OAuthError(
      'invalid_request',
      '登録済みのリダイレクトURLが必要です'
    )
  }
  if (params.get('response_type') !== 'code') {
    throw new OAuthError(
      'unsupported_response_type',
      'response_type=code が必要です'
    )
  }
  const codeChallenge = params.get('code_challenge') || ''
  if (
    params.get('code_challenge_method') !== 'S256' ||
    !/^[A-Za-z0-9_-]{43}$/.test(codeChallenge)
  ) {
    throw new OAuthError('invalid_request', 'PKCE S256 が必要です')
  }
  const resource = params.get('resource') || mcpUrls().resource
  if (resource !== mcpUrls().resource) {
    throw new OAuthError('invalid_target', 'MCP リソースURLが一致しません')
  }
  const scope = normalizeMcpScope(params.get('scope') || MCP_SCOPE)
  const state = params.get('state')
  if (state && state.length > 2048) {
    throw new OAuthError('invalid_request', 'state が長すぎます')
  }
  return {
    clientHost: client.host,
    authorization: {
      clientId,
      clientName: client.name,
      redirectUri,
      codeChallenge,
      resource,
      scope,
      ...(state !== null && { state }),
    } as Authorization,
  }
}

function consentSignature(payload: string) {
  if (!process.env.NEXTAUTH_SECRET)
    throw new Error('NEXTAUTH_SECRET is required')
  return createHmac('sha256', process.env.NEXTAUTH_SECRET)
    .update(`kidoku-mcp-consent:${payload}`)
    .digest('base64url')
}

export function createConsent(userId: string, authorization: Authorization) {
  const payload = Buffer.from(
    JSON.stringify({ userId, authorization, expires: Date.now() + 600000 })
  ).toString('base64url')
  return `${payload}.${consentSignature(payload)}`
}

export function readConsent(value: string, userId: string): Authorization {
  const [payload, signature, extra] = value.split('.')
  const expected = Buffer.from(consentSignature(payload || ''))
  const actual = Buffer.from(signature || '')
  if (
    extra ||
    actual.length !== expected.length ||
    !timingSafeEqual(actual, expected)
  ) {
    throw new OAuthError('invalid_request', '接続確認をやり直してください')
  }
  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString())
  if (parsed.userId !== userId || parsed.expires < Date.now()) {
    throw new OAuthError('invalid_request', '接続確認の有効期限が切れました')
  }
  return parsed.authorization
}

export async function createAuthorizationCode(
  userId: string,
  auth: Authorization
) {
  const code = randomToken()
  await prisma.mcpGrant.create({
    data: {
      userId,
      scope: auth.scope || MCP_SCOPE,
      clientId: auth.clientId,
      clientName: auth.clientName,
      redirectUriHash: hash(auth.redirectUri),
      codeChallengeHash: hash(auth.codeChallenge),
      resource: auth.resource,
      codeHash: hash(code),
      codeExpiresAt: new Date(Date.now() + 5 * 60000),
      expiresAt: new Date(Date.now() + GRANT_SECONDS * 1000),
    },
  })
  return code
}

export async function exchangeToken(body: Record<string, unknown>) {
  const clientId = typeof body.client_id === 'string' ? body.client_id : ''
  const accessToken = randomToken()
  const refreshToken = randomToken()
  const now = new Date()
  const data = {
    codeHash: null,
    tokenHash: hash(accessToken),
    tokenExpiresAt: new Date(Date.now() + ACCESS_TOKEN_SECONDS * 1000),
    refreshHash: hash(refreshToken),
  }
  if (body.resource !== undefined && body.resource !== mcpUrls().resource) {
    throw new OAuthError('invalid_target', 'MCP リソースURLが一致しません')
  }
  const requestedScope =
    body.scope === undefined
      ? undefined
      : normalizeMcpScope(typeof body.scope === 'string' ? body.scope : '')
  if (body.grant_type === 'authorization_code') {
    const code = typeof body.code === 'string' ? body.code : ''
    const verifier =
      typeof body.code_verifier === 'string' ? body.code_verifier : ''
    if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier) || !code) {
      throw new OAuthError('invalid_grant', '認可コードまたは PKCE が無効です')
    }
    const challenge = createHash('sha256').update(verifier).digest('base64url')
    // Hash comparisons preserve exact casing even with MySQL's default collation.
    // The conditional update consumes the code atomically, including concurrent requests.
    const result = await prisma.mcpGrant.updateMany({
      where: {
        clientId,
        ...(requestedScope !== undefined ? { scope: requestedScope } : {}),
        codeHash: hash(code),
        codeChallengeHash: hash(challenge),
        redirectUriHash: hash(
          typeof body.redirect_uri === 'string' ? body.redirect_uri : ''
        ),
        resource: mcpUrls().resource,
        codeExpiresAt: { gt: now },
        expiresAt: { gt: now },
      },
      data,
    })
    if (result.count !== 1)
      throw new OAuthError('invalid_grant', '認可コードまたは PKCE が無効です')
  } else if (body.grant_type === 'refresh_token') {
    const refresh =
      typeof body.refresh_token === 'string' ? body.refresh_token : ''
    if (!refresh)
      throw new OAuthError('invalid_grant', '更新トークンが必要です')
    const result = await prisma.mcpGrant.updateMany({
      where: {
        clientId,
        ...(requestedScope !== undefined ? { scope: requestedScope } : {}),
        refreshHash: hash(refresh),
        resource: mcpUrls().resource,
        expiresAt: { gt: now },
      },
      data,
    })
    if (result.count !== 1)
      throw new OAuthError('invalid_grant', '更新トークンが無効です')
  } else {
    throw new OAuthError('unsupported_grant_type', '未対応の grant_type です')
  }
  const tokenGrant = await prisma.mcpGrant.findUnique({
    where: { tokenHash: data.tokenHash },
    select: { scope: true },
  })
  return {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_SECONDS,
    refresh_token: refreshToken,
    scope: tokenGrant?.scope || MCP_SCOPE,
  }
}

export async function authenticateMcpGrant(req: NextApiRequest) {
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/i.exec(
    req.headers.authorization || ''
  )
  if (!match) return null
  const grant = await prisma.mcpGrant.findUnique({
    where: { tokenHash: hash(match[1]) },
  })
  if (
    !grant ||
    !grant.tokenExpiresAt ||
    grant.tokenExpiresAt <= new Date() ||
    grant.expiresAt <= new Date() ||
    grant.resource !== mcpUrls().resource
  )
    return null
  return { userId: grant.userId, scope: grant.scope || MCP_SCOPE }
}

export async function authenticateMcp(req: NextApiRequest) {
  return (await authenticateMcpGrant(req))?.userId ?? null
}
