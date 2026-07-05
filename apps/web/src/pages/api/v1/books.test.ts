import { createHash } from 'crypto'
import { NextApiRequest, NextApiResponse } from 'next'
import handler from './books'

jest.mock('@/libs/prisma', () => ({
  __esModule: true,
  default: {
    personalAccessToken: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    books: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}))

const prisma = jest.requireMock('@/libs/prisma').default

const TOKEN = 'kidoku_pat_test'
const TOKEN_HASH = createHash('sha256').update(TOKEN).digest('hex')

const mockReq = (query: Record<string, string> = {}, token = TOKEN) =>
  ({
    method: 'GET',
    headers: { authorization: `Bearer ${token}` },
    query,
  }) as unknown as NextApiRequest

const mockRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
    setHeader: jest.fn(),
  }
  res.status.mockReturnValue(res)
  return res as unknown as NextApiResponse & typeof res
}

const mockBook = (id: number) => ({
  id,
  title: `本${id}`,
  author: '著者',
  category: '技術書',
  impression: '◎',
  memo: 'メモ',
  sheet: { name: '2026' },
  finished: new Date('2026-01-15T00:00:00Z'),
  created: new Date('2026-01-01T00:00:00Z'),
  updated: new Date('2026-01-02T00:00:00Z'),
})

describe('/api/v1/books', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    prisma.personalAccessToken.findUnique.mockResolvedValue({
      id: 1,
      userId: 'user-1',
    })
    prisma.personalAccessToken.update.mockResolvedValue({})
    prisma.$transaction.mockResolvedValue([250, [mockBook(1), mockBook(2)]])
  })

  it('デフォルトでpage=1, perPage=100で取得しメタ情報を返す', async () => {
    const res = mockRes()
    await handler(mockReq(), res)

    expect(prisma.books.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 100 })
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        total: 250,
        page: 1,
        perPage: 100,
        totalPages: 3,
      })
    )
    const body = res.json.mock.calls[0][0]
    expect(body.books).toHaveLength(2)
    expect(body.books[0]).toEqual({
      id: 1,
      title: '本1',
      author: '著者',
      category: '技術書',
      impression: '◎',
      memo: 'メモ',
      sheet: '2026',
      finished: '2026-01-15T00:00:00.000Z',
      created: '2026-01-01T00:00:00.000Z',
      updated: '2026-01-02T00:00:00.000Z',
    })
  })

  it('page/perPage指定でskip/takeが計算される', async () => {
    const res = mockRes()
    await handler(mockReq({ page: '3', perPage: '50' }), res)

    expect(prisma.books.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 100, take: 50 })
    )
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3, perPage: 50, totalPages: 5 })
    )
  })

  it('perPageは最大200に切り詰められる', async () => {
    const res = mockRes()
    await handler(mockReq({ perPage: '9999' }), res)

    expect(prisma.books.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 200 })
    )
  })

  it('不正なpageは400を返す', async () => {
    const res = mockRes()
    await handler(mockReq({ page: 'abc' }), res)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(prisma.books.findMany).not.toHaveBeenCalled()
  })

  it('無効なトークンは401を返す', async () => {
    prisma.personalAccessToken.findUnique.mockResolvedValue(null)
    const res = mockRes()
    await handler(mockReq(), res)

    expect(prisma.personalAccessToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: TOKEN_HASH },
    })
    expect(res.status).toHaveBeenCalledWith(401)
  })
})
