import prisma from '@/libs/prisma'
import type { NextApiResponse, NextApiRequest } from 'next'
import { MeiliSearch } from 'meilisearch'

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const books = await prisma.books.findMany({
      where: { sheet_id: 1 },
      select: { id: true, title: true },
    })
    const client = new MeiliSearch({
      host: 'http://localhost:7700',
      apiKey: 'YourMasterKey',
    })
    client
      .index('books')
      .addDocuments(books)
      .then((res) => console.log(res))
    client
      .index('books')
      .search('1')
      .then((res) => console.log(res))
  } catch (error) {
    console.error(error)
    return response.status(200).json({ result: false })
  }
  return response.status(200).json({ result: true })
}
