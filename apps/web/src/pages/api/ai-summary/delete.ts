import { graphqlClient } from '@/libs/graphql/backend-client'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'

export default async (req, res) => {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ result: false, error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).json({ result: false, error: 'Unauthorized' })
    }
    const userId = session.user.id
    const id = Number(req.query.id)

    if (!id) {
      return res.status(400).json({ result: false, error: 'ID is required' })
    }

    const data = await graphqlClient.execute<{
      deleteAiSummary: { deletedCount: number }
    }>(
      userId,
      `
      mutation DeleteAiSummary($input: DeleteAiSummaryInput!) {
        deleteAiSummary(input: $input) {
          deletedCount
        }
      }
    `,
      { input: { id } }
    )

    return res.status(200).json({
      result: true,
      deletedCount: data.deleteAiSummary.deletedCount,
    })
  } catch (e) {
    console.error(e)
    return res
      .status(500)
      .json({ result: false, error: 'Internal server error' })
  }
}
