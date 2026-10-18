import type { NextApiRequest, NextApiResponse } from 'next'
import { authenticateMcp, MCP_SCOPE, mcpUrls } from '@/libs/mcp/oauth'
import {
  handleMcpRequest,
  PROTOCOL_VERSIONS,
  rpcError,
} from '@/libs/mcp/protocol'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'private, no-store')
  try {
    const urls = mcpUrls()
    if (req.headers.origin && req.headers.origin !== urls.issuer)
      return res.status(403).json(rpcError(null, -32000, 'Origin not allowed'))
    const userId = await authenticateMcp(req)
    if (!userId) {
      res.setHeader(
        'WWW-Authenticate',
        `Bearer resource_metadata="${urls.resourceMetadata}", scope="${MCP_SCOPE}"${req.headers.authorization ? ', error="invalid_token"' : ''}`
      )
      return res
        .status(401)
        .json(rpcError(null, -32000, 'Authentication required'))
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json(rpcError(null, -32000, 'Method not allowed'))
    }
    const protocol = req.headers['mcp-protocol-version']
    if (
      protocol !== undefined &&
      (typeof protocol !== 'string' || !PROTOCOL_VERSIONS.includes(protocol))
    )
      return res
        .status(400)
        .json(rpcError(null, -32600, 'Unsupported MCP protocol version'))
    if (
      req.headers['content-type']?.split(';')[0].trim().toLowerCase() !==
      'application/json'
    )
      return res
        .status(415)
        .json(rpcError(null, -32600, 'Content-Type must be application/json'))
    const accept = req.headers.accept || ''
    if (
      !accept.includes('application/json') ||
      !accept.includes('text/event-stream')
    )
      return res
        .status(406)
        .json(
          rpcError(
            null,
            -32600,
            'Accept must include application/json and text/event-stream'
          )
        )
    const result = await handleMcpRequest(req.body, userId)
    if (result === null) return res.status(202).end()
    return res
      .status('error' in result && result.error.code === -32600 ? 400 : 200)
      .json(result)
  } catch {
    console.error('MCP request failed')
    return res
      .status(500)
      .json(rpcError(req.body?.id, -32603, 'Internal error'))
  }
}

export const config = { api: { bodyParser: { sizeLimit: '64kb' } } }
