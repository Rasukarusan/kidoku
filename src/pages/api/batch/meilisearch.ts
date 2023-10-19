import prisma from '@/libs/prisma'
import type { NextApiResponse, NextApiRequest } from 'next'
import { MeiliSearch } from 'meilisearch'
import { isAdmin } from '@/utils/api'

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (!isAdmin(request)) {
    return response.status(401).json({ result: false })
  }
  try {
    const books = await prisma.books.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        image: true,
        is_public_memo: true,
        memo: true,
        user: { select: { name: true, image: true } },
        sheet: { select: { name: true } },
      },
    })
    const b = books.map((book) => {
      const { id, title, author, image, memo, is_public_memo, user, sheet } =
        book
      return {
        id,
        title,
        author,
        image,
        memo: is_public_memo ? memo : '',
        user: user.name,
        sheet: sheet.name,
      }
    })

    const client = new MeiliSearch({
      host: process.env.MEILI_HOST,
      apiKey: process.env.MEILI_MASTER_KEY,
    })
    const re = await client.index('books').addDocuments(b)
    console.log(re)
    // client
    //   .index('books')
    //   .search('金')
    //   .then((res) => console.log(res))
    return response.status(200).json({ result: true })
  } catch (error) {
    console.error(error)
    return response.status(200).json({ result: false })
  }
}
