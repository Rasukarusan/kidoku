import { graphqlClient } from '@/libs/graphql/backend-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ result: false })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ result: false })
    }
    const userId = session.user.id
    const { sheetName, analysis } = req.body

    await graphqlClient.execute(
      userId,
      `
      mutation SaveAiSummary($input: SaveAiSummaryInput!) {
        saveAiSummary(input: $input)
      }
    `,
      { input: { sheetName, analysis } }
    )

    return res.status(200).json({ result: true })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ result: false })
  }
}
