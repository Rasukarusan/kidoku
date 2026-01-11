import type { NextApiResponse, NextApiRequest } from 'next'
import { SearchResult } from '@/types/search'
import { mask } from '@/utils/string'

const GRAPHQL_ENDPOINT =
  process.env.NESTJS_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'

const SEARCH_BOOKS_QUERY = `
  query SearchBooks($input: SearchBooksInput!) {
    searchBooks(input: $input) {
      hits {
        id
        title
        author
        image
        memo
        username
        userImage
        sheet
      }
      totalHits
      hitsPerPage
      page
      hasMore
    }
  }
`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const word = (req.query.q as string) || ''
    const page = Number(req.query.page as string) || 1
    if (!word) return res.status(200).json([])

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: SEARCH_BOOKS_QUERY,
        variables: {
          input: { query: word, page },
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.statusText}`)
    }

    const { data, errors } = await response.json()

    if (errors) {
      console.error('GraphQL errors:', errors)
      throw new Error(`GraphQL errors: ${JSON.stringify(errors)}`)
    }

    const searchResult = data.searchBooks
    if (searchResult.hits.length === 0) return res.status(200).json([])

    const result: SearchResult[] = searchResult.hits.map((hit: any) => ({
      id: hit.id,
      title: hit.title,
      author: hit.author,
      image: hit.image,
      category: '',
      memo: mask(hit.memo),
      username: hit.username,
      userImage: hit.userImage,
      sheet: hit.sheet,
    }))

    return res.status(200).json({
      hits: result,
      next: searchResult.hasMore,
    })
  } catch (error) {
    console.error(error)
    return res.status(200).json({ result: false })
  }
}
