import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'crypto'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import prisma from '@/libs/prisma'
import {
  createAuthorizationCode,
  exchangeToken,
  hash,
  MCP_SCOPE,
  mcpUrls,
  OAuthError,
  readConsent,
  removeUnusedRegistrations,
  validRedirectUri,
} from '@/libs/mcp/oauth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  try {
    const { issuer, resource } = mcpUrls()
    const action = req.query.action
    if (req.method === 'GET' && action === 'resource') {
      return res.json({
        resource,
        authorization_servers: [issuer],
        scopes_supported: [MCP_SCOPE],
        bearer_methods_supported: ['header'],
        resource_name: 'Kidoku 読書記録',
      })
    }
    if (req.method === 'GET' && action === 'metadata') {
      return res.json({
        issuer,
        authorization_endpoint: `${issuer}/mcp/authorize`,
        token_endpoint: `${issuer}/api/mcp/oauth/token`,
        registration_endpoint: `${issuer}/api/mcp/oauth/register`,
        revocation_endpoint: `${issuer}/api/mcp/oauth/revoke`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code', 'refresh_token'],
        token_endpoint_auth_methods_supported: ['none'],
        revocation_endpoint_auth_methods_supported: ['none'],
        code_challenge_methods_supported: ['S256'],
        scopes_supported: [MCP_SCOPE],
        client_id_metadata_document_supported: true,
        authorization_response_iss_parameter_supported: true,
      })
    }
    if (
      !['register', 'authorize', 'token', 'revoke'].includes(String(action))
    ) {
      res.status(404).end()
      return
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS')
      res.status(405).end()
      return
    }
    const body = req.body
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new OAuthError('invalid_request', 'リクエスト本文が不正です')
    if (action === 'register') {
      const uris = body.redirect_uris
      if (
        !Array.isArray(uris) ||
        uris.length < 1 ||
        uris.length > 10 ||
        uris.some(
          (uri) =>
            typeof uri !== 'string' ||
            uri.length > 2048 ||
            !validRedirectUri(uri)
        )
      ) {
        throw new OAuthError(
          'invalid_redirect_uri',
          'HTTPS または loopback のリダイレクトURLが必要です'
        )
      }
      if (
        body.token_endpoint_auth_method &&
        body.token_endpoint_auth_method !== 'none'
      )
        throw new OAuthError(
          'invalid_client_metadata',
          'public client のみ利用できます'
        )
      if (
        (body.grant_types &&
          (!Array.isArray(body.grant_types) ||
            body.grant_types.some(
              (grant) =>
                !['authorization_code', 'refresh_token'].includes(grant)
            ))) ||
        (body.response_types &&
          (!Array.isArray(body.response_types) ||
            body.response_types.some((type) => type !== 'code')))
      )
        throw new OAuthError('invalid_client_metadata', '未対応の認可方式です')
      if (body.scope && body.scope !== MCP_SCOPE)
        throw new OAuthError(
          'invalid_client_metadata',
          'books:read のみ利用できます'
        )
      await removeUnusedRegistrations()
      const client = await prisma.mcpClient.create({
        data: {
          id: randomUUID(),
          name:
            typeof body.client_name === 'string'
              ? body.client_name.trim().slice(0, 120) || 'MCP client'
              : 'MCP client',
          redirectUris: uris,
        },
      })
      return res.status(201).json({
        client_id: client.id,
        client_name: client.name,
        redirect_uris: uris,
        token_endpoint_auth_method: 'none',
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        scope: MCP_SCOPE,
      })
    }
    if (action === 'authorize') {
      // Consent is bound to the logged-in user and the complete authorization request.
      const session = await getServerSession(req, res, authOptions)
      if (!session?.user?.id)
        throw new OAuthError('access_denied', 'ログインが必要です', 401)
      const auth = readConsent(
        typeof body.consent === 'string' ? body.consent : '',
        session.user.id
      )
      const redirect = new URL(auth.redirectUri)
      // RFC 9207: lets the client confirm which authorization server sent the response.
      redirect.searchParams.set('iss', issuer)
      if (auth.state !== undefined)
        redirect.searchParams.set('state', auth.state)
      if (body.decision === 'allow')
        redirect.searchParams.set(
          'code',
          await createAuthorizationCode(session.user.id, auth)
        )
      else redirect.searchParams.set('error', 'access_denied')
      res.redirect(303, redirect.toString())
      return
    }
    if (action === 'token') return res.json(await exchangeToken(body))
    if (action === 'revoke') {
      if (typeof body.token !== 'string' || typeof body.client_id !== 'string')
        throw new OAuthError('invalid_request', 'token と client_id が必要です')
      await prisma.mcpGrant.deleteMany({
        where: {
          clientId: body.client_id,
          OR: [
            { tokenHash: hash(body.token) },
            { refreshHash: hash(body.token) },
          ],
        },
      })
      res.status(200).end()
      return
    }
  } catch (error) {
    if (error instanceof OAuthError)
      return res
        .status(error.status)
        .json({ error: error.error, error_description: error.message })
    console.error('MCP OAuth request failed')
    return res.status(500).json({ error: 'server_error' })
  }
}

export const config = { api: { bodyParser: { sizeLimit: '16kb' } } }
