import { graphqlClient } from '@/libs/graphql/backend-client'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import dayjs from 'dayjs'
import { getServerSession } from 'next-auth/next'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(200).json({ result: false, books: [] })
    }
    const userId = session.user.id
    const sheetName = req.query.sheet as string
    const data = await graphqlClient.execute<{
      books: Array<{
        id: string
        userId: string
        sheetId: number
        title: string
        author: string
        category: string
        image: string
        impression: string
        memo: string
        isPublicMemo: boolean
        finished: string | null
      }>
    }>(
      userId,
      `
      query Books($input: GetBooksInput) {
        books(input: $input) {
          id
          userId
          sheetId
          title
          author
          category
          image
          impression
          memo
          isPublicMemo
          finished
        }
      }
    `,
      { input: { sheetName } }
    )
    const books = data.books.map((book) => {
      const month = dayjs(book.finished).format('M') + '月'
      return {
        id: Number(book.id),
        userId: book.userId,
        month,
        title: book.title,
        author: book.author,
        category: book.category,
        image: book.image,
        impression: book.impression,
        memo: book.memo,
        finished: book.finished,
        is_public_memo: book.isPublicMemo,
        sheet_id: book.sheetId,
        sheet: sheetName,
      }
    })
    return res.status(200).json({
      result: true,
      books,
    })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
