import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import { NO_IMAGE } from '@/libs/constants'
import { graphqlClient } from '@/libs/graphql/backend-client'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res
        .status(401)
        .json({ result: false, message: 'ログインしてください' })
    }
    const userId = session.user.id

    if (req.method === 'POST') {
      const body = JSON.parse(req.body)
      const {
        title,
        author,
        image,
        category,
        is_public_memo,
        impression,
        memo,
        finished,
        sheet,
      } = body
      const data = {
        sheet_id: Number(sheet.id),
        userId,
        title,
        author,
        image,
        category,
        impression,
        memo,
        is_public_memo,
        finished: finished ? new Date(finished) : null,
      }
      // 画像URLをそのまま保存（フロント側で既にアップロード済み）
      data['image'] = image || NO_IMAGE
      const book = await prisma.books.create({ data })

      return res.status(200).json({
        result: true,
        bookTitle: title,
        sheetName: sheet.name,
        bookId: book.id,
      })
    } else if (req.method === 'PUT') {
      const body = JSON.parse(req.body)
      const id = body.id
      const imageUrl = body.image || NO_IMAGE

      // GraphQL mutation呼び出し
      await graphqlClient.execute(
        userId,
        `
          mutation UpdateBook($input: UpdateBookInput!) {
            updateBook(input: $input) {
              id
            }
          }
        `,
        {
          input: {
            id: String(id),
            title: body.title,
            author: body.author,
            category: body.category,
            image: imageUrl,
            impression: body.impression,
            memo: body.memo,
            isPublicMemo: body.is_public_memo,
            isPurchasable: body.is_purchasable,
            finished: body.finished ? new Date(body.finished) : null,
            sheetId: body.sheet_id ? Number(body.sheet_id) : undefined,
          },
        }
      )

      return res.status(200).json({ result: true, image: imageUrl })
    } else if (req.method === 'DELETE') {
      const body = JSON.parse(req.body)
      const id = body.id

      // GraphQL mutation呼び出し
      await graphqlClient.execute(
        userId,
        `
          mutation DeleteBook($input: DeleteBookInput!) {
            deleteBook(input: $input)
          }
        `,
        {
          input: {
            id: String(id),
          },
        }
      )

      return res.status(200).json({ result: true })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
