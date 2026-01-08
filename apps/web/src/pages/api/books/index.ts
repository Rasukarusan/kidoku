import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import { NO_IMAGE } from '@/libs/constants'
import { put } from '@vercel/blob'
import { bufferToWebp } from '@/libs/sharp/bufferToWebp'
import { addDocuments } from '@/libs/meilisearch/addDocuments'
import crypto from 'crypto'
// import { setTimeout } from 'timers/promises'
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '3mb',
    },
  },
}

async function updateMeiliSearchDocuments() {
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
    return result
  } catch (error) {
    console.error('updateMeiliSearchDocuments error:', error)
    // エラーが発生してもAPIレスポンスは継続
    return null
  }
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
      await updateMeiliSearchDocuments()
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
      const graphqlEndpoint =
        process.env.NESTJS_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'
      const secretKey = process.env.NEXTAUTH_SECRET
      if (!secretKey) {
        throw new Error('NEXTAUTH_SECRET is not configured')
      }

      const timestamp = Date.now().toString()
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(`${userId}:false:${timestamp}`)
        .digest('hex')

      const graphqlResponse = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          'X-User-Admin': 'false',
          'X-Timestamp': timestamp,
          'X-Signature': signature,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateBook($input: UpdateBookInput!) {
              updateBook(input: $input) {
                id
              }
            }
          `,
          variables: {
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
          },
        }),
      })

      if (!graphqlResponse.ok) {
        const errorText = await graphqlResponse.text()
        console.error('GraphQL update failed:', errorText)
        throw new Error('GraphQL update failed')
      }

      await updateMeiliSearchDocuments()
      return res.status(200).json({ result: true })
    } else if (req.method === 'DELETE') {
      const body = JSON.parse(req.body)
      const id = body.id

      // GraphQL mutation呼び出し
      const graphqlEndpoint =
        process.env.NESTJS_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'
      const secretKey = process.env.NEXTAUTH_SECRET
      if (!secretKey) {
        throw new Error('NEXTAUTH_SECRET is not configured')
      }

      const timestamp = Date.now().toString()
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(`${userId}:false:${timestamp}`)
        .digest('hex')

      const graphqlResponse = await fetch(graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          'X-User-Admin': 'false',
          'X-Timestamp': timestamp,
          'X-Signature': signature,
        },
        body: JSON.stringify({
          query: `
            mutation DeleteBook($input: DeleteBookInput!) {
              deleteBook(input: $input)
            }
          `,
          variables: {
            input: {
              id: String(id),
            },
          },
        }),
      })

      if (!graphqlResponse.ok) {
        const errorText = await graphqlResponse.text()
        console.error('GraphQL delete failed:', errorText)
        throw new Error('GraphQL delete failed')
      }

      await updateMeiliSearchDocuments()
      return res.status(200).json({ result: true })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
