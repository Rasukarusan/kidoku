import type { NextApiRequest, NextApiResponse } from 'next'
import { graphqlClient } from '@/libs/graphql/backend-client'

const SEARCH_GOOGLE_BOOKS_QUERY = `
  query SearchGoogleBooks($input: SearchGoogleBooksInput!) {
    searchGoogleBooks(input: $input) {
      id
      title
      author
      category
      image
    }
  }
`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const query = (req.query.q as string) || ''
    if (!query) return res.status(200).json([])

    const data = await graphqlClient.executePublic<{
      searchGoogleBooks: Array<{
        id: string
        title: string
        author: string
        category: string
        image: string
      }>
    }>(SEARCH_GOOGLE_BOOKS_QUERY, { input: { query } })

    return res.status(200).json(data.searchGoogleBooks)
  } catch (error) {
    console.error('Google Books search error:', error)
    return res.status(500).json({ error: 'Search failed' })
  }
}
