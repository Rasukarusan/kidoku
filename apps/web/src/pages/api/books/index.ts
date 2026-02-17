import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import { NO_IMAGE } from '@/libs/constants'
import { put } from '@vercel/blob'
import { bufferToWebp } from '@/libs/sharp/bufferToWebp'
import { graphqlClient } from '@/libs/graphql/backend-client'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '3mb',
    },
  },
}

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
      data['image'] = image === NO_IMAGE || image.includes('http') ? image : ''
      const book = await prisma.books.create({ data })

      // 画像選択された場合はVercel Blobにアップロードする
      if (image !== NO_IMAGE && !image.includes('http')) {
        // 先頭の「data:image/png;base64,」部分を除き、Base64部分のみを取得
        const base64Image = image.split(',')[1]
        const imageBuffer = Buffer.from(base64Image, 'base64')
        const buffer = await bufferToWebp(imageBuffer)
        const { url } = await put(`${book.id}.webp`, buffer, {
          access: 'public',
        })
        await prisma.books.update({
          where: { id: book.id },
          data: {
            image: url,
          },
        })
      }
      // ISRキャッシュを再検証
      try {
        await res.revalidate(`/books/${book.id}`)
      } catch {
        // 再検証失敗は無視（次回のISR更新で反映される）
      }

      return res.status(200).json({
        result: true,
        bookTitle: title,
        sheetName: sheet.name,
        bookId: book.id,
      })
    } else if (req.method === 'PUT') {
      const body = JSON.parse(req.body)
      const id = body.id
      let imageUrl = body.image

      // 画像選択された場合はVercel Blobにアップロードしてからレコード更新
      if (imageUrl !== NO_IMAGE && !imageUrl.startsWith('http')) {
        const base64Image = imageUrl.split(',')[1]
        const imageBuffer = Buffer.from(base64Image, 'base64')
        const buffer = await bufferToWebp(imageBuffer)
        const { url } = await put(`${id}.webp`, buffer, {
          access: 'public',
        })
        imageUrl = url
      }

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

      // ISRキャッシュを再検証
      try {
        await res.revalidate(`/books/${id}`)
      } catch {
        // 再検証失敗は無視（次回のISR更新で反映される）
      }

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

      // ISRキャッシュを再検証
      try {
        await res.revalidate(`/books/${id}`)
      } catch {
        // 再検証失敗は無視（次回のISR更新で反映される）
      }

      return res.status(200).json({ result: true })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
