import { Prisma } from '@prisma/client'
import prisma from '@/libs/prisma'
import type { Pagination } from '@/utils/pagination'

const include = { sheet: { select: { name: true } } } as const
type Book = Prisma.booksGetPayload<{ include: typeof include }>

function serialize(book: Book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    category: book.category,
    impression: book.impression,
    memo: book.memo,
    sheet: book.sheet.name,
    finished: book.finished?.toISOString() ?? null,
    created: book.created.toISOString(),
    updated: book.updated.toISOString(),
  }
}

export async function listPersonalBooks(
  userId: string,
  { page, perPage }: Pagination,
  query?: string
) {
  const where: Prisma.booksWhereInput = {
    userId,
    ...(query && {
      OR: ['title', 'author', 'memo'].map((field) => ({
        [field]: { contains: query },
      })),
    }),
  }
  const [total, books] = await prisma.$transaction([
    prisma.books.count({ where }),
    prisma.books.findMany({
      where,
      include,
      orderBy: [{ finished: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
  ])
  return {
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
    books: books.map(serialize),
  }
}

export async function getPersonalBook(userId: string, id: number) {
  const book = await prisma.books.findFirst({ where: { userId, id }, include })
  return book ? serialize(book) : null
}
