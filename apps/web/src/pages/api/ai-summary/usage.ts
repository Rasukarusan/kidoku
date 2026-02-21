import { graphqlClient } from '@/libs/graphql/backend-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ result: false })
    }
    const userId = session.user.id
    const data = await graphqlClient.execute<{
      aiSummaryUsage: number
    }>(
      userId,
      `
      query AiSummaryUsage {
        aiSummaryUsage
      }
    `
    )
    return res.status(200).json({ result: true, count: data.aiSummaryUsage })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ result: false })
  }
}
