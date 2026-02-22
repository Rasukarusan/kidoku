import { SearchResult } from '@/types/search'
import { mask } from '@/utils/string'
import { gql } from '@apollo/client'
import client from '@/libs/apollo'

const SEARCH_BOOKS_QUERY = gql`
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
      hasMore
    }
  }
`

const SEARCH_GOOGLE_BOOKS_QUERY = gql`
  query SearchGoogleBooks($input: SearchGoogleBooksInput!) {
    searchGoogleBooks(input: $input) {
      id
      title
      author
      category
      image
    }
  }
`

const LATEST_SOFTWARE_DESIGN_QUERY = gql`
  query LatestSoftwareDesign {
    latestSoftwareDesign {
      yearMonth
      title
      coverImageUrl
      author
      category
    }
  }
`

/**
 * Software Designの最新号を取得
 */
const getLatestSoftwareDesign = async (): Promise<SearchResult | null> => {
  try {
    const { data } = await client.query({
      query: LATEST_SOFTWARE_DESIGN_QUERY,
      fetchPolicy: 'no-cache',
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

  // GraphQL経由でGoogle Books APIを検索
  const { data } = await client.query({
    query: SEARCH_GOOGLE_BOOKS_QUERY,
    variables: { input: { query: title } },
    fetchPolicy: 'no-cache',
  })

  data.searchGoogleBooks?.forEach(
    (item: {
      id: string
      title: string
      author: string
      category: string
      image: string
    }) => {
      result.push({
        id: item.id,
        title: item.title,
        author: item.author,
        category: item.category,
        image: item.image,
        memo: '',
      })
    }
  )

  return result
}

/**
 * ユーザー本棚検索
 */
export const searchUserBooks = async (
  title: string
): Promise<SearchResult[]> => {
  const { data } = await client.query({
    query: SEARCH_BOOKS_QUERY,
    variables: { input: { query: title } },
    fetchPolicy: 'no-cache',
  })

  const searchResult = data.searchBooks
  if (!searchResult || searchResult.hits.length === 0) return []

  return searchResult.hits.map(
    (hit: {
      id: string
      title: string
      author: string
      image: string
      memo: string
      username: string
      userImage: string | null
      sheet: string
    }) => ({
      id: hit.id,
      title: hit.title,
      author: hit.author,
      image: hit.image,
      category: '',
      memo: mask(hit.memo),
      username: hit.username,
      userImage: hit.userImage,
      sheet: hit.sheet,
    })
  )
}
