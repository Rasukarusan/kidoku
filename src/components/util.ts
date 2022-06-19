import axios from 'axios'
import { Item } from './types'

/**
 * 書籍検索
 */
export const searchBooks = (title: string): Promise<Item[]> => {
  return axios
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
  return axios
    .get(url)
    .then((res) => res.data.suggestions.map((suggestion) => suggestion.value))
}
