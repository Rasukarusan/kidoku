/** @jest-environment node */
import type { NextApiRequest, NextApiResponse } from 'next'
import handler from './mcp'

jest.mock('@/libs/prisma', () => ({
  __esModule: true,
  default: { mcpGrant: { findUnique: jest.fn() } },
}))
const prisma = jest.requireMock('@/libs/prisma').default
function response() {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    end: jest.fn(),
    setHeader: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res as unknown as NextApiResponse & typeof res
}
function request(overrides = {}) {
  return {
    method: 'POST',
    headers: {
      authorization: `Bearer ${'a'.repeat(43)}`,
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
    },
    body: { jsonrpc: '2.0', id: 1, method: 'tools/list' },
    ...overrides,
  } as NextApiRequest
}
beforeEach(() => {
  jest.clearAllMocks()
  process.env.NEXTAUTH_URL = 'https://kidoku.example'
  prisma.mcpGrant.findUnique.mockResolvedValue({
    userId: 'user-1',
    resource: 'https://kidoku.example/api/mcp',
    tokenExpiresAt: new Date(Date.now() + 10000),
    expiresAt: new Date(Date.now() + 20000),
  })
})

test('advertises resource metadata when authentication is required', async () => {
  const res = response()
  await handler(request({ headers: {} }), res)
  expect(res.status).toHaveBeenCalledWith(401)
  expect(res.setHeader).toHaveBeenCalledWith(
    'WWW-Authenticate',
    expect.stringContaining(
      'https://kidoku.example/.well-known/oauth-protected-resource/api/mcp'
    )
  )
})

test('serves tools over authenticated JSON Streamable HTTP', async () => {
  const res = response()
  await handler(request(), res)
  expect(res.status).toHaveBeenCalledWith(200)
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 1,
      result: expect.objectContaining({ tools: expect.any(Array) }),
    })
  )
})

test('accepts initialized notification with 202 and no body', async () => {
  const res = response()
  await handler(
    request({ body: { jsonrpc: '2.0', method: 'notifications/initialized' } }),
    res
  )
  expect(res.status).toHaveBeenCalledWith(202)
  expect(res.end).toHaveBeenCalled()
  expect(res.json).not.toHaveBeenCalled()
})

test('rejects foreign browser origins before checking credentials', async () => {
  const res = response()
  await handler(request({ headers: { origin: 'https://evil.example' } }), res)
  expect(res.status).toHaveBeenCalledWith(403)
  expect(prisma.mcpGrant.findUnique).not.toHaveBeenCalled()
})

test.each(['GET', 'DELETE'])(
  'rejects unsupported stream/session method %s',
  async (method) => {
    const res = response()
    await handler(request({ method }), res)
    expect(res.status).toHaveBeenCalledWith(405)
  }
)

test('rejects invalid protocol and media headers', async () => {
  for (const [header, value, status] of [
    ['mcp-protocol-version', 'invalid', 400],
    ['content-type', 'text/plain', 415],
    ['accept', 'application/json', 406],
  ] as const) {
    const req = request()
    req.headers[header] = value
    const res = response()
    await handler(req, res)
    expect(res.status).toHaveBeenCalledWith(status)
  }
})

test('does not expose internal database errors', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {})
  prisma.mcpGrant.findUnique.mockRejectedValue(new Error('database-secret'))
  const res = response()
  await handler(request(), res)
  expect(res.status).toHaveBeenCalledWith(500)
  expect(JSON.stringify(res.json.mock.calls)).not.toContain('database-secret')
  log.mockRestore()
})
