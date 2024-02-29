import type { NextApiRequest, NextApiResponse } from 'next'
import { EventType } from '@/types/event_queue'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { getChannelName } from '@/libs/pusher/util'
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
  const userId = session.user.id
  const channel = getChannelName(userId)
  const event = EventType.AddBook
  const data = { ...req.body, sentFromMobile }
  // pusher.sendToUser(userId, event, { hoge: 11111111 })
  trigger(channel, event, data)
  return res.status(200).json({ result: true })
}
