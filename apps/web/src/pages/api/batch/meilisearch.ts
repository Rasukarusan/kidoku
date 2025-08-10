import prisma from '@/libs/prisma'
import type { NextApiResponse, NextApiRequest } from 'next'
import { isAdmin } from '@/utils/api'
import { addDocuments } from '@/libs/meilisearch/addDocuments'

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
    const documents = books
      .filter((book) => book.sheet !== null) // sheetがnullのレコードを除外
      .map((book) => {
        const { id, title, author, image, memo, is_public_memo, user, sheet } =
          book
        return {
          id,
          title,
          author,
          image,
          memo: is_public_memo ? memo : '',
          username: user.name,
          userImage: user.image,
          sheet: sheet.name,
        }
      })
    const result = await addDocuments('books', documents)
    console.log(result)
    return response.status(200).json({ result: true })
  } catch (error) {
    console.error(error)
    return response.status(200).json({ result: false })
  }
}
