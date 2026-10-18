/** @jest-environment node */
import { handleMcpRequest } from './protocol'

jest.mock('@/libs/prisma', () => ({
  __esModule: true,
  default: {
    books: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    $transaction: jest.fn(),
  },
}))
const prisma = jest.requireMock('@/libs/prisma').default
const call = (name: string, args: unknown) => ({
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: { name, arguments: args },
})
const book = {
  id: 1,
  title: '本',
  author: '著者',
  category: '技術',
  impression: '◎',
  memo: '非公開のメモ',
  sheet: { name: '2026' },
  finished: null,
  created: new Date(0),
  updated: new Date(0),
}

beforeEach(() => jest.clearAllMocks())

test('initializes, lists read-only tools and accepts notifications', async () => {
  const result = await handleMcpRequest(
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        clientInfo: { name: 'test', version: '1' },
        capabilities: {},
      },
    },
    'user-1'
  )
  expect(result).toMatchObject({
    result: { protocolVersion: '2025-06-18', capabilities: { tools: {} } },
  })
  const list = await handleMcpRequest(
    { jsonrpc: '2.0', id: 2, method: 'tools/list' },
    'user-1'
  )
  expect(list).toMatchObject({
    result: {
      tools: [
        expect.objectContaining({
          name: 'list_books',
          annotations: expect.objectContaining({ readOnlyHint: true }),
        }),
        expect.objectContaining({ name: 'get_book' }),
      ],
    },
  })
  await expect(
    handleMcpRequest(
      { jsonrpc: '2.0', method: 'notifications/initialized' },
      'user-1'
    )
  ).resolves.toBeNull()
})

test('list and search are scoped to the authenticated user, with pagination and no full memos', async () => {
  prisma.$transaction.mockResolvedValue([1, [book]])
  const result = await handleMcpRequest(
    call('list_books', { page: 2, perPage: 10, query: '技術' }),
    'user-1'
  )
  expect(prisma.books.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: {
        userId: 'user-1',
        OR: [
          { title: { contains: '技術' } },
          { author: { contains: '技術' } },
          { memo: { contains: '技術' } },
        ],
      },
      skip: 10,
      take: 10,
    })
  )
  expect(JSON.stringify(result)).not.toContain('非公開のメモ')
})

test('get_book includes the owner in the DB lookup and returns the full memo', async () => {
  prisma.books.findFirst.mockResolvedValue(book)
  const result = await handleMcpRequest(call('get_book', { id: 1 }), 'user-1')
  expect(prisma.books.findFirst).toHaveBeenCalledWith(
    expect.objectContaining({ where: { userId: 'user-1', id: 1 } })
  )
  expect(JSON.stringify(result)).toContain('非公開のメモ')
  prisma.books.findFirst.mockResolvedValue(null)
  await expect(
    handleMcpRequest(call('get_book', { id: 2 }), 'user-1')
  ).resolves.toMatchObject({ result: { isError: true } })
})

test.each([
  call('get_book', {}),
  call('get_book', { id: '1' }),
  call('get_book', { id: 1, userId: 'user-2' }),
  call('list_books', { perPage: 101 }),
  call('list_books', { page: 0 }),
  call('list_books', null),
  call('delete_book', { id: 1 }),
])('rejects invalid arguments without querying books: %j', async (request) => {
  await expect(handleMcpRequest(request, 'user-1')).resolves.toMatchObject({
    error: { code: -32602 },
  })
  expect(prisma.books.findFirst).not.toHaveBeenCalled()
  expect(prisma.books.findMany).not.toHaveBeenCalled()
})

test.each([
  [],
  null,
  { jsonrpc: '1.0', id: 1, method: 'ping' },
  { jsonrpc: '2.0', id: {}, method: 'ping' },
])('rejects malformed JSON-RPC: %j', async (body) => {
  await expect(handleMcpRequest(body, 'user-1')).resolves.toMatchObject({
    error: { code: -32600 },
  })
})
