import type { NextApiRequest, NextApiResponse } from 'next'
import { EventType } from '@/types/event_queue'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { trigger } from '@/libs/pusher/trigger'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ result: false })
  }
  const sentFromMobile = req.headers['user-agent'].includes('Mobile')
  const channel = session.user.id
  const event = EventType.AddBook
  const data = { ...req.body, sentFromMobile }
  trigger(channel, event, data)
  return res.status(200).json({ result: true })
}
