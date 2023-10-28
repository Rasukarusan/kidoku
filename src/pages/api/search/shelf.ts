import type { NextApiResponse, NextApiRequest } from 'next'
import { MeiliSearch } from 'meilisearch'
import { SearchResult } from '@/types/search'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const word = (req.query.q as string) || ''
    if (!word) return res.status(200).json([])
    const client = new MeiliSearch({
      host: process.env.MEILI_HOST,
      apiKey: process.env.MEILI_MASTER_KEY,
    })
    const response = await client.index('books').search(word, {
      attributesToHighlight: ['title', 'memo'],
      highlightPreTag: '<span class="highlight">',
      highlightPostTag: '</span>',
      attributesToCrop: ['memo'],
      cropLength: 20,
    })
    if (response.hits.length === 0) return res.status(200).json([])
    const result: SearchResult[] = []
    response.hits.map((hit) => {
      const {
        id,
        title,
        author,
        image,
        memo,
        username,
        userImage,
        sheet,
        _formatted,
      } = hit
      result.push({
        id,
        title: _formatted.title,
        author,
        image,
        category: '',
        memo: _formatted.memo,
        username,
        userImage,
        sheet,
      })
    })
    return res.status(200).json(result)
  } catch (error) {
    console.error(error)
    return res.status(200).json({ result: false })
  }
}
