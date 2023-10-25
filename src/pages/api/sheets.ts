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
      const sheet = await prisma.sheets.findFirst({
        where: { userId },
        select: { id: true, name: true, order: true },
        orderBy: [{ order: 'desc' }],
      })
      const order = sheet ? sheet.order + 1 : 1
      await prisma.sheets.create({
        data: { userId, name, order },
      })
      return res.status(200).json({ result: true })
    } else if (req.method === 'PUT') {
      const { oldName, newName } = JSON.parse(req.body)
      const sheet = await prisma.sheets.update({
        where: { userId_name: { userId, name: oldName } },
        data: { name: newName },
      })
      return res.status(200).json({ result: true })
    } else if (req.method === 'DELETE') {
      const { name } = JSON.parse(req.body)
      const sheet = await prisma.sheets.delete({
        where: { userId_name: { userId, name } },
      })
      return res.status(200).json({ result: true })
    }
    return res.status(200).json({ result: true })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
