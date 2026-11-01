/** @jest-environment node */
import { handleMcpRequest } from './protocol'

jest.mock('@/libs/prisma', () => ({
  __esModule: true,
  default: {
    item: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn() },
    collection: { findMany: jest.fn() },
    $transaction: jest.fn(),
  },
}))
jest.mock('@kidoku/reading-store', () => ({
  readBooks: jest.fn(),
  readBook: jest.fn(),
  countBooks: jest.fn(),
}))
const reading = jest.requireMock('@kidoku/reading-store')
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
    'user-1',
    'items:read'
  )
  expect(list).toMatchObject({
    result: {
      tools: expect.arrayContaining([
        expect.objectContaining({ name: 'list_items' }),
        expect.objectContaining({ name: 'get_item' }),
        expect.objectContaining({ name: 'list_collections' }),
        expect.objectContaining({
          name: 'list_books',
          annotations: expect.objectContaining({ readOnlyHint: true }),
        }),
        expect.objectContaining({ name: 'get_book' }),
      ]),
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
  reading.countBooks.mockResolvedValue(1)
  reading.readBooks.mockResolvedValue([book])
  prisma.$transaction.mockImplementation(async (callback) => callback(prisma))
  const result = await handleMcpRequest(
    call('list_books', { page: 2, perPage: 10, query: '技術' }),
    'user-1'
  )
  expect(reading.readBooks).toHaveBeenCalledWith(
    prisma,
    expect.objectContaining({
      filter: {
        userId: 'user-1',
        search: { text: '技術', fields: ['title', 'author', 'memo'] },
      },
      offset: 10,
      limit: 10,
    })
  )
  expect(JSON.stringify(result)).not.toContain('非公開のメモ')
})

test('get_book includes the owner in the DB lookup and returns the full memo', async () => {
  reading.readBook.mockResolvedValue(book)
  const result = await handleMcpRequest(call('get_book', { id: 1 }), 'user-1')
  expect(reading.readBook).toHaveBeenCalledWith(prisma, {
    userId: 'user-1',
    id: 1,
  })
  expect(JSON.stringify(result)).toContain('非公開のメモ')
  reading.readBook.mockResolvedValue(null)
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
  expect(reading.readBook).not.toHaveBeenCalled()
  expect(reading.readBooks).not.toHaveBeenCalled()
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

test('generic item lookup scopes private memos and histories to the authenticated owner', async () => {
  prisma.item.findFirst.mockResolvedValue(null)
  const result = await handleMcpRequest(
    call('get_item', { id: 99 }),
    'owner',
    'items:read'
  )
  expect(prisma.item.findFirst).toHaveBeenCalledWith(
    expect.objectContaining({ where: { userId: 'owner', id: 99 } })
  )
  expect(result).toMatchObject({ result: { isError: true } })
})

test('generic item listing carries type and collection filters without returning private memos', async () => {
  prisma.$transaction.mockResolvedValue([
    1,
    [
      {
        id: 99,
        itemTypeId: 'movie',
        title: '映画',
        attributes: { directors: ['監督'] },
        collections: [{ collectionId: 10 }],
      },
    ],
  ])
  const result = await handleMcpRequest(
    call('list_items', { itemTypeId: 'movie', collectionId: 10 }),
    'owner',
    'items:read'
  )
  expect(prisma.item.findMany).toHaveBeenCalledWith(
    expect.objectContaining({
      where: {
        userId: 'owner',
        itemTypeId: 'movie',
        collections: { some: { collectionId: 10 } },
      },
      select: expect.not.objectContaining({ memo: true }),
    })
  )
  expect(JSON.stringify(result)).toContain('movie')
})

test('legacy book grants cannot access generic private collection records', async () => {
  const result = await handleMcpRequest(
    call('get_item', { id: 99 }),
    'owner',
    'books:read'
  )
  expect(result).toMatchObject({
    error: { message: 'items:read scope required' },
  })
  expect(prisma.item.findFirst).not.toHaveBeenCalled()
  const list = await handleMcpRequest(
    { jsonrpc: '2.0', id: 2, method: 'tools/list' },
    'owner',
    'books:read'
  )
  expect(list).toMatchObject({
    result: {
      tools: [
        expect.objectContaining({ name: 'list_books' }),
        expect.objectContaining({ name: 'get_book' }),
      ],
    },
  })
})
