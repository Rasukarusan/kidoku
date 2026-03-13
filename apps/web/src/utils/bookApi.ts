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
 * 楽天ブックスAPIで書籍を検索（ISBN）
 */
export const searchRakutenBooks = async (
  isbn: string
): Promise<SearchResult | undefined> => {
  const client = new ApiClient()
  try {
    const applicationId = process.env.NEXT_PUBLIC_RAKUTEN_APPLICATION_ID
    if (!applicationId) {
      console.error('NEXT_PUBLIC_RAKUTEN_APPLICATION_ID が設定されていません')
      return undefined
    }

    const params = new URLSearchParams({
      applicationId,
      isbn: isbn.replace(/-/g, ''),
      outOfStockFlag: '1',
    })
    const res = await client.get(
      `https://openapi.rakuten.co.jp/services/api/BooksBook/Search/20170404?${params.toString()}`
    )

    const item = res.data.Items?.[0]?.Item
    if (!item) return undefined

    return {
      id: item.isbn || isbn,
      title: item.title || '不明なタイトル',
      author: item.author || '著者不明',
      category: item.booksGenreId || '未分類',
      image:
        item.largeImageUrl?.replace('http:', 'https:') ||
        item.mediumImageUrl?.replace('http:', 'https:') ||
        NO_IMAGE,
      memo: '',
      isbn: item.isbn || isbn,
    }
  } catch (error) {
    console.error('楽天ブックスAPI error:', error)
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

  // 1. まず楽天ブックスAPIで検索
  const rakutenResult = await searchRakutenBooks(normalizedISBN)
  if (rakutenResult && rakutenResult.title !== '不明なタイトル') {
    // Software DesignのISBNの場合は専用処理で画像を更新
    if (isSoftwareDesignISBN(normalizedISBN, rakutenResult.title)) {
      const softwareDesignResult = await searchSoftwareDesign(
        normalizedISBN,
        rakutenResult.title
      )
      if (softwareDesignResult) {
        return {
          ...rakutenResult,
          image: softwareDesignResult.image,
        }
      }
    }
    return rakutenResult
  }

  // 2. 楽天で見つからない場合はopenBDで検索
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
          image: softwareDesignResult.image,
        }
      }
    }

    // 楽天の部分的な結果とopenBDの結果をマージ
    if (rakutenResult) {
      return {
        ...openBDResult,
        image:
          rakutenResult.image !== NO_IMAGE
            ? rakutenResult.image
            : openBDResult.image,
        category:
          openBDResult.category !== '未分類'
            ? openBDResult.category
            : rakutenResult.category,
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
  return rakutenResult || openBDResult
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
