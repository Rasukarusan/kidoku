import prisma, { parse } from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import { NO_IMAGE } from '@/libs/constants'

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
      console.log('')
      const template = await prisma.template_books.findMany({
        where: {
          userId,
        },
        orderBy: [{ created: 'desc' }],
      })
      return res.status(200).json({
        result: true,
        templates: parse(template),
      })
    } else if (req.method === 'POST') {
      const body = JSON.parse(req.body)
      console.log(body)
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
      // 画像URLをそのまま保存（フロント側で既にアップロード済み）
      data['image'] = image || NO_IMAGE
      await prisma.template_books.create({ data })

      return res.status(200).json({
        result: true,
      })
    } else if (req.method === 'DELETE') {
      const body = JSON.parse(req.body)
      const id = body.id
      await prisma.template_books.delete({
        where: { id, userId },
      })
      return res.status(200).json({ result: true })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
