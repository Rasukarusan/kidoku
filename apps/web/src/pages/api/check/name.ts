import { graphqlClient } from '@/libs/graphql/backend-client'
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
    const userId = session.user.id
    const data = await graphqlClient.execute<{
      isNameAvailable: boolean
    }>(
      userId,
      `
      query IsNameAvailable($input: CheckNameAvailableInput!) {
        isNameAvailable(input: $input)
      }
    `,
      { input: { name } }
    )
    // 名前が使用可能ならtrue
    res.status(200).json({ result: data.isNameAvailable })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
