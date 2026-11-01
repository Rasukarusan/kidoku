import { IMAGE_SIZE_ERROR, isImageTooLarge } from '@/utils/imageUpload'
import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import { NO_IMAGE } from '@/libs/constants'
import { put } from '@vercel/blob'
import { bufferToWebp } from '@/libs/sharp/bufferToWebp'

export const config = {
  api: {
    bodyParser: {
      // 3MiB の画像は Base64 で4MiBになる。JSONとメモの分も確保する。
      sizeLimit: '5mb',
    },
  },
}

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ result: false, error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res
        .status(401)
        .json({ result: false, message: 'ログインしてください' })
    }
    const userId = session.user.id

    // POST: 画像アップロードを含むため、Prisma直接アクセスを維持
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    if (isImageTooLarge(body.image)) {
      return res.status(413).json({ result: false, message: IMAGE_SIZE_ERROR })
    }
    const { name, title, author, image, category, isPublicMemo, memo } = body
    const data = {
      userId,
      name,
      title,
      itemTypeId: 'book',
      attributes: { authors: author ? [author] : [] },
      imageUrl: image,
      category,
      memo,
      isPublicMemo,
    }
    const isImageSelected = image !== NO_IMAGE && !image.includes('http')
    // 画像選択された際はそのままDBに保存するとカラムの容量エラーとなるため、一旦空文字でDB保存し、VercelにアップロードしたあとにVercelのURLをDB保存する
    data['imageUrl'] = isImageSelected ? '' : image
    const template = await prisma.itemTemplate.create({ data })

    // 画像選択されたものはVercel Blobにアップロードする
    if (isImageSelected) {
      const imageBuffer = Buffer.from(image.split(',')[1], 'base64')
      const buffer = await bufferToWebp(imageBuffer)
      const { url } = await put(`template_${template.id}.webp`, buffer, {
        access: 'public',
      })
      await prisma.itemTemplate.update({
        where: { id: template.id },
        data: {
          imageUrl: url,
        },
      })
    }
    return res.status(200).json({
      result: true,
    })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
