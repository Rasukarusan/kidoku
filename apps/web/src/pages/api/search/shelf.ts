import type { NextApiResponse, NextApiRequest } from 'next'
import { SearchResult } from '@/types/search'
import { mask } from '@/utils/string'
import { graphqlClient } from '@/libs/graphql/backend-client'

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

    const data = await graphqlClient.executePublic<{
      searchBooks: {
        hits: Array<{
          id: string
          title: string
          author: string
          image: string
          memo: string
          username: string
          userImage: string | null
          sheet: string
        }>
        totalHits: number
        hitsPerPage: number
        page: number
        hasMore: boolean
      }
    }>(SEARCH_BOOKS_QUERY, { input: { query: word, page } })

    const searchResult = data.searchBooks
    if (searchResult.hits.length === 0) return res.status(200).json([])

    const result: SearchResult[] = searchResult.hits.map((hit) => ({
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
