import { graphqlClient } from '@/libs/graphql/backend-client'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'

export default async (req, res) => {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(200).json({ result: false })
    }
    const userId = session.user.id
    if (req.method === 'GET') {
      const { year } = req.query
      const data = await graphqlClient.execute<{
        yearlyTopBooks: Array<{
          year: string
          order: number
          book: { id: number; title: string; author: string; image: string }
        }>
      }>(
        userId,
        `
        query YearlyTopBooks($input: GetYearlyTopBooksInput!) {
          yearlyTopBooks(input: $input) {
            year
            order
            book {
              id
              title
              author
              image
            }
          }
        }
      `,
        { input: { year } }
      )
      return res
        .status(200)
        .json({ result: true, yearlyTopBooks: data.yearlyTopBooks })
    } else if (req.method === 'POST') {
      const { year, order, bookId } = JSON.parse(req.body)
      await graphqlClient.execute(
        userId,
        `
        mutation UpsertYearlyTopBook($input: UpsertYearlyTopBookInput!) {
          upsertYearlyTopBook(input: $input)
        }
      `,
        { input: { year, order, bookId } }
      )
      return res.status(200).json({ result: true })
    } else if (req.method === 'DELETE') {
      const { year, order } = JSON.parse(req.body)
      await graphqlClient.execute(
        userId,
        `
        mutation DeleteYearlyTopBook($input: DeleteYearlyTopBookInput!) {
          deleteYearlyTopBook(input: $input)
        }
      `,
        { input: { year, order } }
      )
      return res.status(200).json({ result: true })
    }
  } catch (e) {
    console.error(e)
    res.status(400).json({ result: false })
  }
}
