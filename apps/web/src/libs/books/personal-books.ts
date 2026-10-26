import {
  readBooks,
  readBook,
  countBooks,
  BookFilter,
  ReadingBook,
} from '@kidoku/reading-store'
import prisma from '@/libs/prisma'
import type { Pagination } from '@/utils/pagination'

function serialize(book: ReadingBook) {
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
  const filter: BookFilter = {
    userId,
    ...(query
      ? { search: { text: query, fields: ['title', 'author', 'memo'] } }
      : {}),
  }
  const [total, books] = await prisma.$transaction(async (tx) =>
    Promise.all([
      countBooks(tx, filter),
      readBooks(tx, {
        filter,
        orderBy: [{ finished: 'desc' }, { id: 'desc' }],
        offset: (page - 1) * perPage,
        limit: perPage,
      }),
    ])
  )
  return {
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
    books: books.map(serialize),
  }
}

export async function getPersonalBook(userId: string, id: number) {
  const book = await readBook(prisma, { userId, id })
  return book ? serialize(book) : null
}
