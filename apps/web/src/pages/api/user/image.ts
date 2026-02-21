import { graphqlClient } from '@/libs/graphql/backend-client'

export default async (req, res) => {
  try {
    const name = req.query.username as string
    const data = await graphqlClient.executePublic<{
      userImage: string
    }>(
      `
      query UserImage($input: GetUserImageInput!) {
        userImage(input: $input)
      }
    `,
      { input: { name } }
    )
    res.status(200).json({ image: data.userImage })
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
