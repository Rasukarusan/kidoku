import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import pusher from '@/libs/pusher/server'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ result: false })
  }
  const { socket_id } = req.body
  const userId = session.user.id
  const presenceData = {
    id: userId,
    user_info: { name: session.user.name, image: session.user.image },
  }
  const authResponse = pusher.authenticateUser(socket_id, presenceData)
  return res.send(authResponse)
}
