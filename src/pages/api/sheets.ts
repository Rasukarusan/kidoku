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
    const sheets = await prisma.sheets.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: [{ order: 'desc' }],
    })
    console.log(sheets)
    return res.status(200).json({ result: true, sheets })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
