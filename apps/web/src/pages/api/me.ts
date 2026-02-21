import { graphqlClient } from '@/libs/graphql/backend-client'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      res.status(401).json({ result: false })
    }
    const body = JSON.parse(req.body)
    const { name } = body
    const userId = session.user.id
    await graphqlClient.execute(
      userId,
      `
      mutation UpdateUserName($input: UpdateUserNameInput!) {
        updateUserName(input: $input) {
          name
        }
      }
    `,
      { input: { name } }
    )
    res.status(200).json({ result: true })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
