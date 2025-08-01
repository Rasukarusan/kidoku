import type { NextApiResponse, NextApiRequest } from 'next'
import { SearchResult } from '@/types/search'
import { searchBooks } from '@/libs/meilisearch/searchBooks'
import { mask } from '@/utils/string'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const word = (req.query.q as string) || ''
    const page = Number(req.query.page as string) || 1
    if (!word) return res.status(200).json([])
    const response = await searchBooks(word, page)
    if (response.hits.length === 0) return res.status(200).json([])
    const result: SearchResult[] = []
    response.hits.map((hit) => {
      const { id, author, image, username, userImage, sheet, _formatted } = hit
      result.push({
        id,
        title: _formatted.title,
        author,
        image,
        category: '',
        memo: mask(_formatted.memo),
        username,
        userImage,
        sheet,
      })
    })
    return res.status(200).json({
      hits: result,
      next: response.totalHits / response.hitsPerPage > page,
    })
  } catch (error) {
    console.error(error)
    return res.status(200).json({ result: false })
  }
}
