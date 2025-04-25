import client from '@/libs/meilisearch'

export const searchBooks = async (query: string, page = 1) => {
  return await client.index('books').search(query, {
    attributesToHighlight: ['title', 'memo'],
    highlightPreTag: '<span class="highlight">',
    highlightPostTag: '</span>',
    attributesToCrop: ['title', 'memo'],
    cropLength: 15,
    page,
  })
}
