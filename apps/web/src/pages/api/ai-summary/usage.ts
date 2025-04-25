import dayjs from 'dayjs'
import prisma from '@/libs/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ result: false })
    }
    const userId = session.user.id
    const start = dayjs().startOf('month').toDate()
    const end = dayjs().endOf('month').toDate()
    const aiSummaries = await prisma.aiSummaries.findMany({
      where: {
        userId,
        created: {
          gte: start,
          lt: end,
        },
      },
      select: { id: true },
    })
    return res.status(200).json({ result: true, count: aiSummaries.length })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
