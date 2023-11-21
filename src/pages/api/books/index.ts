import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import { NO_IMAGE } from '@/libs/constants'
import { put } from '@vercel/blob'
import { bufferToWebp } from '@/libs/sharp/bufferToWebp'
// import { setTimeout } from 'timers/promises'
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
        description,
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
        sheet_id: sheet.id,
        userId,
        title,
        author,
        image,
        category,
        impression,
        memo,
        is_public_memo,
        finished: new Date(finished),
      }
      data['image'] = image === NO_IMAGE || image.includes('http') ? image : ''
      // await setTimeout(500)
      const book = await prisma.books.create({ data })

      // 画像選択された場合はVercel Blobにアップロードする
      if (image !== NO_IMAGE && !image.includes('http')) {
        const imageBuffer = Buffer.from(image, 'base64')
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
      return res.status(200).json({
        result: true,
        message: `『${title}』を「${sheet.name}」に追加しました`,
      })
    } else if (req.method === 'PUT') {
      const body = JSON.parse(req.body)
      const id = body.id
      const book = await prisma.books.findUnique({
        where: { id, userId },
      })
      if (!book) {
        res.status(401).json({ result: false })
      }
      const data = {
        title: body.title,
        author: body.author,
        category: body.category,
        image: body.image,
        impression: body.impression,
        memo: body.memo,
        is_public_memo: body.is_public_memo,
        updated: new Date(),
      }
      const { image } = body
      // 画像選択された場合はVercel Blobにアップロードしてからレコード更新
      if (image !== NO_IMAGE && !image.includes('http')) {
        const imageBuffer = Buffer.from(image, 'base64')
        const buffer = await bufferToWebp(imageBuffer)
        const { url } = await put(`${book.id}.webp`, buffer, {
          access: 'public',
        })
        data.image = url
      }
      await prisma.books.update({
        where: { id, userId },
        data,
      })
      return res.status(200).json({ data })
    } else if (req.method === 'DELETE') {
      const body = JSON.parse(req.body)
      const id = body.id
      const book = await prisma.books.delete({
        where: { id, userId },
      })
      return res.status(200).json({ result: true })
    }
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
