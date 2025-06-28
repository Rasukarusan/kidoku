import { ApiClient } from '@/libs/apiClient'
import { NO_IMAGE } from '@/libs/constants'
import { SearchResult } from '@/types/search'
import { ApolloClient, InMemoryCache, gql } from '@apollo/client'

/**
 * Software Designの最新号を取得
 */
const getLatestSoftwareDesign = async (): Promise<SearchResult | null> => {
  try {
    // サーバーサイドかクライアントサイドかを判定
    const isServer = typeof window === 'undefined'

    // APIエンドポイントのURLを適切に設定
    const graphqlEndpoint = isServer
      ? 'http://localhost:4000/graphql' // サーバーサイドでは直接localhost
      : process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
        'http://localhost:4000/graphql'

    // 認証不要のクライアントを作成
    const publicApolloClient = new ApolloClient({
      uri: graphqlEndpoint,
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          fetchPolicy: 'no-cache',
        },
      },
    })

    const { data } = await publicApolloClient.query({
      query: gql`
        query {
          latestSoftwareDesign {
            yearMonth
            title
            coverImageUrl
            author
            category
          }
        }
      `,
    })

    if (data?.latestSoftwareDesign) {
      const sd = data.latestSoftwareDesign
      return {
        id: `sd-${sd.yearMonth}`,
        title: sd.title,
        author: sd.author,
        category: sd.category,
        image: sd.coverImageUrl,
        memo: '[期待]\n\n[感想]\n',
      }
    }
  } catch (error) {
    console.error('Failed to fetch latest Software Design:', error)
    // エラーの詳細を確認
    if (error.networkError) {
      console.error('Network error:', error.networkError)
    }
    if (error.graphQLErrors) {
      console.error('GraphQL errors:', error.graphQLErrors)
    }

    // フォールバック: 現在の年月を計算して固定データを返す
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 2 // 次月号
    const adjustedMonth = month > 12 ? 1 : month
    const adjustedYear = month > 12 ? year + 1 : year
    const yearMonth = `${adjustedYear}${adjustedMonth.toString().padStart(2, '0')}`

    return {
      id: `sd-${yearMonth}`,
      title: `Software Design ${adjustedYear}年${adjustedMonth}月号`,
      author: '技術評論社',
      category: 'ソフトウェア開発',
      image: `https://gihyo.jp/assets/images/cover/2024/thumb/TH320_642501${yearMonth}.jpg`,
      memo: '[期待]\n\n[感想]\n',
    }
  }
  return null
}

/**
 * 書籍検索
 */
export const searchBooks = async (title: string): Promise<SearchResult[]> => {
  const client = new ApiClient()
  const result: SearchResult[] = []

  // Software Design検索の判定
  const searchLower = title.toLowerCase()
  const shouldIncludeSoftwareDesign =
    searchLower.includes('soft') ||
    searchLower.includes('design') ||
    searchLower.includes('sd') ||
    searchLower.includes('技術評論') ||
    searchLower.includes('ソフトウェア')

  // Software Designの最新号を追加
  if (shouldIncludeSoftwareDesign) {
    const latestSD = await getLatestSoftwareDesign()
    if (latestSD) {
      result.push(latestSD)
    }
  }

  // Google Books APIで検索
  await client
    .get(`https://www.googleapis.com/books/v1/volumes?q=${title}`)
    .then((res) => {
      res.data.items?.map((item) => {
        const { title, authors, categories, imageLinks } = item.volumeInfo
        result.push({
          id: item.id,
          title: title,
          author: Array.isArray(authors) ? authors.join(',') : '-',
          category: categories ? categories.join(',') : '-',
          image: imageLinks?.thumbnail?.replace('http:', 'https:') || NO_IMAGE,
          memo: '',
        })
      })
    })
  return result
}

/**
 * ISBNで書籍検索（レガシー版 - 後方互換性のため残す）
 * 新規実装では searchBookWithRetry を使用してください
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
      const { title, authors, categories, imageLinks } = item.volumeInfo
      const book = {
        id: item.id,
        title: title,
        author: Array.isArray(authors) ? authors.join(',') : '-',
        category: categories ? categories.join(',') : '-',
        image: imageLinks?.thumbnail?.replace('http:', 'https:') || NO_IMAGE,
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
