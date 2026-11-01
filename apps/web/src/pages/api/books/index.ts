import { IMAGE_SIZE_ERROR, isImageTooLarge } from '@/utils/imageUpload'
import { randomUUID } from 'node:crypto'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import { NO_IMAGE } from '@/libs/constants'
import { put } from '@vercel/blob'
import { bufferToWebp } from '@/libs/sharp/bufferToWebp'
import { graphqlClient } from '@/libs/graphql/backend-client'

export const config = {
  api: {
    bodyParser: {
      // 3MiB の画像は Base64 で4MiBになる。JSONとメモの分も確保する。
      sizeLimit: '5mb',
    },
  },
}

const resolveBookImage = async (image: unknown, pathname: string) => {
  if (image == null || image === '' || image === NO_IMAGE) return NO_IMAGE
  if (typeof image !== 'string') throw new Error('画像の形式が不正です')
  if (/^https?:\/\//i.test(image)) return image
  const base64 = /^data:image\/[\w.+-]+;base64,([A-Za-z0-9+/]+={0,2})$/.exec(
    image
  )?.[1]
  if (!base64) throw new Error('画像の形式が不正です')
  const buffer = await bufferToWebp(Buffer.from(base64, 'base64'))
  const { url } = await put(pathname, buffer, { access: 'public' })
  return url
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
      const body =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (isImageTooLarge(body.image)) {
        return res
          .status(413)
          .json({ result: false, message: IMAGE_SIZE_ERROR })
      }
      const {
        title,
        author,
        image,
        category,
        isPublicMemo,
        impression,
        memo,
        finished,
        sheet,
      } = body
      const data = {
        sheetId: Number(sheet.id),
        userId,
        title,
        author,
        image,
        category,
        impression,
        memo,
        isPublicMemo,
        finished: finished ? new Date(finished) : null,
      }
      const finalImage = await resolveBookImage(
        image,
        `books/${randomUUID()}.webp`
      )
      data['image'] = finalImage
      const result = await graphqlClient.execute<{
        saveItem: { id: number }
      }>(
        userId,
        `mutation RegisterBookItem($input: SaveItemInput!) { saveItem(input: $input) { id } }`,
        {
          input: {
            itemTypeId: 'book',
            collectionIds: [data.sheetId],
            title,
            attributes: {
              authors: author ? [author] : [],
              ...(body.isbn ? { isbn: body.isbn } : {}),
            },
            category,
            imageUrl: finalImage,
            rating: impression,
            memo,
            isPublicMemo,
            ...(data.finished
              ? {
                  initialLog: {
                    kind: 'read',
                    occurredAt: data.finished,
                    memo: '',
                    rating: null,
                  },
                }
              : {}),
          },
        }
      )
      const book = { id: result.saveItem.id }

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
        bookImage: finalImage,
      })
    } else if (req.method === 'PUT') {
      const body =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body
      if (isImageTooLarge(body.image)) {
        return res
          .status(413)
          .json({ result: false, message: IMAGE_SIZE_ERROR })
      }
      const id = body.id
      const imageUrl = await resolveBookImage(body.image, `${id}.webp`)

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
            isPublicMemo: body.isPublicMemo,
            isPurchasable: body.isPurchasable,
            price: body.price ?? null,
            finished: body.finished ? new Date(body.finished) : null,
            sheetId: body.sheetId ? Number(body.sheetId) : undefined,
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
      const body =
        typeof req.body === 'string' ? JSON.parse(req.body) : req.body
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
