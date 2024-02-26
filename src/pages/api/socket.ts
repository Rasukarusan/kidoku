import Pusher from 'pusher'
import type { NextApiRequest, NextApiResponse } from 'next'
import { EventType } from '@/types/event_queue'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth/[...nextauth]'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ result: false })
  }
  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    secret: process.env.PUSHER_SECRET,
    key: process.env.NEXT_PUBLIC_PUSHER_KEY,
    useTLS: true,
  })
  const sentFromMobile = req.headers['user-agent'].includes('Mobile')
  pusher.trigger(session.user.id, EventType.AddBook, {
    ...req.body,
    sentFromMobile,
  })
  return res.status(200).json({ result: true })
}
