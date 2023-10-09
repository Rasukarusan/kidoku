import { ApiClient } from '@/libs/apiClient'
import { NO_IMAGE } from '@/libs/constants'
import { Item } from '@/types/search'

/**
 * 書籍検索
 */
export const searchBooks = (title: string): Promise<Item[]> => {
  const client = new ApiClient()
  return client
    .get(`https://www.googleapis.com/books/v1/volumes?q=${title}`)
    .then((res) => res.data.items)
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

/**
 * 検索結果から必要な本の情報を抜き出す
 */
export const getBookInfo = (item: Item) => {
  if (!item) return {}
  const { title, description, authors, imageLinks, categories } =
    item.volumeInfo
  const author = authors ? authors.join(',') : '-'
  const category = categories ? categories.join(',') : '-'
  const image = imageLinks ? imageLinks.thumbnail : NO_IMAGE
  return { title, description, author, image, category }
}
