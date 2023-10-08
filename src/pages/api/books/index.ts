import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
// import { setTimeout } from 'timers/promises'

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
      console.log(JSON.parse(req.body))
      // await setTimeout(500)
      const result = await prisma.books.create({
        data: {
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
        },
      })
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
      const {
        title,
        author,
        category,
        image,
        impression,
        memo,
        is_public_memo,
      } = body
      const success = await prisma.books.update({
        where: { id, userId },
        data: {
          title,
          author,
          category,
          image,
          impression,
          memo,
          is_public_memo,
        },
      })
      return res.status(200).json({ result: true })
    }
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
