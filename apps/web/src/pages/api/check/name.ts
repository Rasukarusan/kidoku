import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'

export default async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ result: false })
    }
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      res.status(401).json({ result: false })
    }
    const body = JSON.parse(req.body)
    const { name } = body
    const id = session.user.id
    const user = await prisma.user.findFirst({
      where: { name },
    })
    // 指定の名前のユーザーが存在しないなら登録可能
    res.status(200).json({ result: user === null })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
