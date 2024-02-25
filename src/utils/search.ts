import { ApiClient } from '@/libs/apiClient'
import { NO_IMAGE } from '@/libs/constants'
import { SearchResult } from '@/types/search'

/**
 * 書籍検索
 */
export const searchBooks = async (title: string): Promise<SearchResult[]> => {
  const client = new ApiClient()
  const result: SearchResult[] = []
  await client
    .get(`https://www.googleapis.com/books/v1/volumes?q=${title}`)
    .then((res) => {
      res.data.items.map((item) => {
        const { title, description, authors, categories, imageLinks } =
          item.volumeInfo
        result.push({
          id: item.id,
          title: title,
          author: Array.isArray(authors) ? authors.join(',') : '-',
          category: categories ? categories.join(',') : '-',
          image: imageLinks ? imageLinks.thumbnail : NO_IMAGE,
          memo: description ?? '',
        })
      })
    })
  return result
}

/**
 * ISBNで書籍検索
 */
export const searchBooksByIsbn = async (
  isbn: string
): Promise<SearchResult> => {
  const client = new ApiClient()
  return await client
    .get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
    .then((res) => {
      const item = res.data.items?.pop()
      if (!item) return undefined
      const { title, description, authors, categories, imageLinks } =
        item.volumeInfo
      const book = {
        id: item.id,
        title: title,
        author: Array.isArray(authors) ? authors.join(',') : '-',
        category: categories ? categories.join(',') : '-',
        image: imageLinks ? imageLinks.thumbnail : NO_IMAGE,
        memo: '',
      }
      return book
    })
}

/**
 * ユーザー本棚検索
 */
export const searchUserBooks = async (
  title: string
): Promise<SearchResult[]> => {
  const client = new ApiClient()
  const result = await client
    .get(`/api/search/shelf?q=${title}`)
    .then((res) => res.data)
  return result.hits
}

/**
 * サジェスト取得
 */
export const getSuggestions = async (keyword: string) => {
  const url = encodeURI(
    `https://completion.amazon.co.jp/api/2017/suggestions?limit=11&prefix=${keyword}&suggestion-type=WIDGET&suggestion-type=KEYWORD&page-type=Gateway&alias=aps&site-variant=desktop&version=3&event=onKeyPress&wc=&lop=ja_JP&avg-ks-time=995&fb=1&plain-mid=6&client-info=amazon-search-ui`
  )
  const client = new ApiClient()
  return client
    .get(url)
    .then((res) => res.data.suggestions.map((suggestion) => suggestion.value))
}
