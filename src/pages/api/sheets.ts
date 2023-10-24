import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(200).json({ result: false, sheets: [] })
    }
    const userId = session.user.id

    if (req.method === 'GET') {
      const sheets = await prisma.sheets.findMany({
        where: { userId },
        select: { id: true, name: true },
        orderBy: [{ order: 'desc' }],
      })
      return res.status(200).json({ result: true, sheets })
    } else if (req.method === 'POST') {
      const { name } = JSON.parse(req.body)
      // TODO: orderを調整
      await prisma.sheets.create({
        data: { userId, name },
      })
      return res.status(200).json({ result: true })
    }
    return res.status(200).json({ result: true })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
