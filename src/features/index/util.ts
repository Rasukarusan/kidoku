import { ApiClient } from '@/libs/apiClient'
import { Item, SelectItems } from './types'

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
 * クリップボードにコピーするテキストを取得
 */
export const getCopyText = (selectItems: SelectItems): string => {
  let text = ''
  const textList = selectItems.map((item) => {
    const title = item.volumeInfo.title ?? '-'
    const authors = item.volumeInfo.authors?.join(',') ?? '-'
    const categories = item.volumeInfo.categories ?? '-'
    const imageLink = item.volumeInfo.imageLinks
      ? item.volumeInfo.imageLinks.thumbnail
      : '/no-image.png'
    text += title + '\t' + authors + '\t' + categories + '\t' + imageLink + '\n'
  })
  return text
}

/**
 * 文字列を指定した長さで区切る
 */
export const truncate = (str: string, len: number) => {
  if (!str) return '-'
  return str.length <= len ? str : str.substr(0, len) + '...'
}
