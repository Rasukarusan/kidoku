import prisma from '@/libs/prisma'
import type { NextApiResponse, NextApiRequest } from 'next'
import { MeiliSearch } from 'meilisearch'

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  try {
    const books = await prisma.books.findMany({
      select: { id: true, title: true },
    })
    const client = new MeiliSearch({
      host: 'http://localhost:7700',
      apiKey: 'YourMasterKey',
    })
    const re = await client.index('books').addDocuments(books)
    console.log(re)
    // client
    //   .index('books')
    //   .search('金')
    //   .then((res) => console.log(res))
  } catch (error) {
    console.error(error)
    return response.status(200).json({ result: false })
  }
  return response.status(200).json({ result: true })
}
