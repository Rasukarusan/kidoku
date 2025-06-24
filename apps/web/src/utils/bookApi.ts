import { ApiClient } from '@/libs/apiClient'
import { NO_IMAGE } from '@/libs/constants'
import { SearchResult } from '@/types/search'
import { normalizeISBN, convertISBN10to13 } from './isbn'
import client from '@/libs/apollo'
import { gql } from '@apollo/client'

const SEARCH_SOFTWARE_DESIGN_BY_ISBN = gql`
  query SearchSoftwareDesignByISBN(
    $isbn: String!
    $year: Int
    $month: Int
    $title: String
  ) {
    searchSoftwareDesignByISBN(
      isbn: $isbn
      year: $year
      month: $month
      title: $title
    ) {
      id
      title
      author
      category
      image
      memo
      isbn
    }
  }
`

/**
 * Software DesignのISBNかどうかを判定
 */
const isSoftwareDesignISBN = (isbn: string, title?: string): boolean => {
  const normalizedISBN = isbn.replace(/-/g, '')

  // 技術評論社のISBNパターン
  const isTechReviewISBN = normalizedISBN.startsWith('9784297')

  // タイトルによる判定
  const isSoftwareDesignTitle = title
    ? title.toLowerCase().includes('software design') ||
      title.includes('ソフトウェアデザイン')
    : false

  return isTechReviewISBN || isSoftwareDesignTitle
}

/**
 * Software Design専用の検索
 */
const searchSoftwareDesign = async (
  isbn: string,
  title?: string
): Promise<SearchResult | null> => {
  try {
    const { data } = await client.query({
      query: SEARCH_SOFTWARE_DESIGN_BY_ISBN,
      variables: { isbn, title },
    })

    return data?.searchSoftwareDesignByISBN || null
  } catch (error) {
    console.error('Software Design search error:', error)
    return null
  }
}

/**
 * Google Books APIで書籍を検索
 */
export const searchGoogleBooks = async (
  isbn: string
): Promise<SearchResult | undefined> => {
  const client = new ApiClient()
  try {
    const res = await client.get(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    )
    const item = res.data.items?.pop()
    if (!item) return undefined

    const { title, authors, categories, imageLinks, industryIdentifiers } =
      item.volumeInfo
    return {
      id: item.id,
      title: title || '不明なタイトル',
      author: Array.isArray(authors) ? authors.join(', ') : '著者不明',
      category: categories ? categories.join(', ') : '未分類',
      image:
        imageLinks?.thumbnail?.replace('http:', 'https:') ||
        imageLinks?.smallThumbnail?.replace('http:', 'https:') ||
        NO_IMAGE,
      memo: '',
      isbn:
        industryIdentifiers?.find((id) => id.type === 'ISBN_13')?.identifier ||
        isbn,
    }
  } catch (error) {
    console.error('Google Books API error:', error)
    return undefined
  }
}

/**
 * openBD APIで書籍を検索
 */
export const searchOpenBD = async (
  isbn: string
): Promise<SearchResult | undefined> => {
  const client = new ApiClient()
  try {
    // ISBN-13に変換
    const isbn13 = isbn.length === 10 ? convertISBN10to13(isbn) : isbn
    const res = await client.get(`https://api.openbd.jp/v1/get?isbn=${isbn13}`)

    if (!res.data || res.data.length === 0 || !res.data[0]) return undefined

    const bookData = res.data[0]
    const summary = bookData.summary
    const onix = bookData.onix

    return {
      id: summary.isbn,
      title: summary.title || '不明なタイトル',
      author: summary.author || '著者不明',
      category:
        onix?.DescriptiveDetail?.Subject?.[0]?.SubjectHeadingText || '未分類',
      image: summary.cover
        ? summary.cover.replace('http:', 'https:')
        : NO_IMAGE,
      memo: '',
      isbn: summary.isbn,
    }
  } catch (error) {
    console.error('openBD API error:', error)
    return undefined
  }
}

/**
 * 複数のAPIソースから書籍情報を検索（優先順位付き）
 */
export const searchBookWithMultipleSources = async (
  isbn: string
): Promise<SearchResult | undefined> => {
  const normalizedISBN = normalizeISBN(isbn)

  // 1. まずGoogle Books APIで検索（画像取得の成功率が高い）
  const googleResult = await searchGoogleBooks(normalizedISBN)
  if (googleResult && googleResult.title !== '不明なタイトル') {
    // Software DesignのISBNの場合は専用処理で画像を更新
    if (isSoftwareDesignISBN(normalizedISBN, googleResult.title)) {
      const softwareDesignResult = await searchSoftwareDesign(
        normalizedISBN,
        googleResult.title
      )
      if (softwareDesignResult) {
        return {
          ...googleResult,
          image: softwareDesignResult.image, // 正しい画像URLに更新
        }
      }
    }
    return googleResult
  }

  // 2. Google Books APIで見つからない場合はopenBDで検索
  const openBDResult = await searchOpenBD(normalizedISBN)
  if (openBDResult) {
    // Software DesignのISBNの場合は専用処理で画像を更新
    if (isSoftwareDesignISBN(normalizedISBN, openBDResult.title)) {
      const softwareDesignResult = await searchSoftwareDesign(
        normalizedISBN,
        openBDResult.title
      )
      if (softwareDesignResult) {
        return {
          ...openBDResult,
          image: softwareDesignResult.image, // 正しい画像URLに更新
        }
      }
    }

    // Googleの部分的な結果とopenBDの結果をマージ
    if (googleResult) {
      return {
        ...openBDResult,
        // Googleの画像があれば優先（画像取得率が高いため）
        image:
          googleResult.image !== NO_IMAGE
            ? googleResult.image
            : openBDResult.image,
        // カテゴリーはopenBDを優先（日本の書籍カテゴリー情報が正確）
        category:
          openBDResult.category !== '未分類'
            ? openBDResult.category
            : googleResult.category,
      }
    }
    return openBDResult
  }

  // 3. どちらでも見つからない場合、Software DesignのISBNならタイトルなしで検索
  if (isSoftwareDesignISBN(normalizedISBN)) {
    const softwareDesignResult = await searchSoftwareDesign(normalizedISBN)
    if (softwareDesignResult) {
      return softwareDesignResult
    }
  }

  // 4. 最終的に部分的な結果でも返す
  return googleResult || openBDResult
}

/**
 * リトライ機能付き書籍検索
 */
export const searchBookWithRetry = async (
  isbn: string,
  maxRetries = 3
): Promise<SearchResult | undefined> => {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await searchBookWithMultipleSources(isbn)
      if (result) return result
    } catch (error) {
      lastError = error as Error
      console.error(`Search attempt ${i + 1} failed:`, error)
      // 次の試行まで少し待機
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }

  throw lastError || new Error('Book not found after retries')
}
