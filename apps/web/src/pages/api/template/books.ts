import prisma from '@/libs/prisma'
import { graphqlClient } from '@/libs/graphql/backend-client'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import { NO_IMAGE } from '@/libs/constants'
import { put } from '@vercel/blob'
import { bufferToWebp } from '@/libs/sharp/bufferToWebp'

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

    if (req.method === 'GET') {
      const data = await graphqlClient.execute<{
        templateBooks: Array<{
          id: string
          name: string
          title: string
          author: string
          category: string
          image: string
          memo: string
          isPublicMemo: boolean
          created: string
          updated: string
        }>
      }>(
        userId,
        `
        query TemplateBooks {
          templateBooks {
            id
            name
            title
            author
            category
            image
            memo
            isPublicMemo
            created
            updated
          }
        }
      `
      )
      const templates = data.templateBooks.map((t) => ({
        id: Number(t.id),
        name: t.name,
        title: t.title,
        author: t.author,
        category: t.category,
        image: t.image,
        memo: t.memo,
        is_public_memo: t.isPublicMemo,
        created: t.created,
        updated: t.updated,
      }))
      return res.status(200).json({
        result: true,
        templates,
      })
    } else if (req.method === 'POST') {
      // POST: 画像アップロードを含むため、Prisma直接アクセスを維持
      const body = JSON.parse(req.body)
      const { name, title, author, image, category, is_public_memo, memo } =
        body
      const data = {
        userId,
        name,
        title,
        author,
        image,
        category,
        memo,
        is_public_memo,
      }
      const isImageSelected = image !== NO_IMAGE && !image.includes('http')
      // 画像選択された際はそのままDBに保存するとカラムの容量エラーとなるため、一旦空文字でDB保存し、VercelにアップロードしたあとにVercelのURLをDB保存する
      data['image'] = isImageSelected ? '' : image
      const template = await prisma.template_books.create({ data })

      // 画像選択されたものはVercel Blobにアップロードする
      if (isImageSelected) {
        const imageBuffer = Buffer.from(image, 'base64')
        const buffer = await bufferToWebp(imageBuffer)
        const { url } = await put(`template_${template.id}.webp`, buffer, {
          access: 'public',
        })
        await prisma.template_books.update({
          where: { id: template.id },
          data: {
            image: url,
          },
        })
      }
      return res.status(200).json({
        result: true,
      })
    } else if (req.method === 'DELETE') {
      const body = JSON.parse(req.body)
      const id = body.id
      await graphqlClient.execute(
        userId,
        `
        mutation DeleteTemplateBook($input: DeleteTemplateBookInput!) {
          deleteTemplateBook(input: $input)
        }
      `,
        { input: { id } }
      )
      return res.status(200).json({ result: true })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
