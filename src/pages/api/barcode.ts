import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'
import prisma from '@/libs/prisma'
import { EventType } from '@/types/event_queue'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      res.status(401).json({ result: false })
    }
    if (req.method === 'GET') {
      const isMobile = req.headers['user-agent'].includes('Mobile')
      if (isMobile) {
        return res.status(200).json({ result: false })
      }
      const userId = session.user.id
      const queue = await prisma.eventQueues.findFirst({
        where: { userId, event: EventType.AddBook },
      })
      return res
        .status(200)
        .json({ result: true, book: JSON.parse(queue?.message) })
    }
    if (req.method === 'POST') {
      const body = JSON.parse(req.body)
      const { book } = body
      const message = JSON.stringify(book)
      const userId = session.user.id
      const result = await prisma.eventQueues.upsert({
        where: {
          userId_event: {
            userId: userId,
            event: EventType.AddBook,
          },
        },
        update: {
          message,
        },
        create: {
          userId: userId,
          event: EventType.AddBook,
          message,
        },
      })
      return res.status(200).json(true)
    }
  } catch (e) {
    console.log(e)
    return res.status(400).json(false)
  }
}
