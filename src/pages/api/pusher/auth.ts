import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import pusher from '@/libs/pusher/server'
import { auth } from '@/libs/pusher/util'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('チャンネルAUTH')
  console.log(req.body)
  const session = await getServerSession(req, res, authOptions)
  if (!session) {
    res.status(401).json({ result: false })
  }
  const { socket_id, channel_name } = req.body
  const userId = session.user.id
  const isAuth = auth(userId, channel_name)
  if (isAuth) {
    const presenceData = {
      user_id: userId,
      user_info: { name: session.user.name, image: session.user.image },
    }
    const authResponse = pusher.authorizeChannel(
      socket_id,
      channel_name,
      presenceData
    )
    console.log(authResponse)
    return res.send(authResponse)
  }
  return res.status(403).json({ result: false })
}
