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

const SEARCH_EXTERNAL_BOOKS_QUERY = gql`
  query SearchExternalBooks($input: SearchExternalBooksInput!) {
    searchExternalBooks(input: $input) {
      id
      image
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
 * Rakuten Books(backend経由)でISBN検索して表紙画像を取得
 */
const searchRakutenBooksCover = async (
  isbn: string
): Promise<string | undefined> => {
  try {
    const isbn13 = isbn.length === 10 ? convertISBN10to13(isbn) : isbn
    const { data } = await client.query({
      query: SEARCH_EXTERNAL_BOOKS_QUERY,
      variables: { input: { query: isbn13 } },
      fetchPolicy: 'no-cache',
    })

    const items = data?.searchExternalBooks || []
    const exactMatch = items.find((item: { id: string; image: string }) => {
      return normalizeISBN(item.id || '') === isbn13
    })
    const fallback = items.find((item: { image: string }) => {
      return !!item.image && item.image !== NO_IMAGE
    })
    const image = exactMatch?.image || fallback?.image

    if (!image) return undefined
    return image.replace('http:', 'https:')
  } catch (error) {
    console.error('Rakuten Books search error:', error)
    return undefined
  }
}

/**
 * Rakuten Books(backend経由)でタイトル検索して表紙画像を取得
 * 楽天のISBNインデックスは欠落があるため、openBDから取れたタイトルで検索する。
 * ISBNが一致する候補を優先し、見つからなければ先頭の画像ありを採用する。
 */
const searchRakutenBooksCoverByTitle = async (
  title: string,
  isbnForMatch?: string
): Promise<string | undefined> => {
  try {
    const { data } = await client.query({
      query: SEARCH_EXTERNAL_BOOKS_QUERY,
      variables: { input: { query: title } },
      fetchPolicy: 'no-cache',
    })

    const items = data?.searchExternalBooks || []

    // ISBN完全一致を最優先
    if (isbnForMatch) {
      const exactMatch = items.find((item: { id: string; image: string }) => {
        return normalizeISBN(item.id || '') === isbnForMatch
      })
      if (exactMatch?.image && exactMatch.image !== NO_IMAGE) {
        return exactMatch.image.replace('http:', 'https:')
      }
    }

    // 次点: 画像ありの先頭
    const fallback = items.find((item: { image: string }) => {
      return !!item.image && item.image !== NO_IMAGE
    })
    if (!fallback?.image) return undefined
    return fallback.image.replace('http:', 'https:')
  } catch (error) {
    console.error('Rakuten Books title search error:', error)
    return undefined
  }
}

/**
 * openBD APIで書籍を検索
 */
export const searchOpenBD = async (
  isbn: string
): Promise<SearchResult | undefined> => {
  const apiClient = new ApiClient()
  try {
    // ISBN-13に変換
    const isbn13 = isbn.length === 10 ? convertISBN10to13(isbn) : isbn
    const res = await apiClient.get(
      `https://api.openbd.jp/v1/get?isbn=${isbn13}`
    )

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
  let rakutenCoverImage: string | undefined

  // 1. openBDで検索
  const openBDResult = await searchOpenBD(normalizedISBN)
  if (openBDResult) {
    // Software DesignのISBNの場合は専用処理で画像を更新
    if (isSoftwareDesignISBN(normalizedISBN, openBDResult.title)) {
      const softwareDesignResult = await searchSoftwareDesign(
        normalizedISBN,
        openBDResult.title
      )
      if (softwareDesignResult) {
        if (!softwareDesignResult.image) {
          rakutenCoverImage =
            rakutenCoverImage || (await searchRakutenBooksCover(normalizedISBN))
        }
        return {
          ...openBDResult,
          image:
            softwareDesignResult.image ||
            rakutenCoverImage ||
            openBDResult.image,
        }
      }
    }

    if (!openBDResult.image || openBDResult.image === NO_IMAGE) {
      // openBDから取れたタイトルで楽天をタイトル検索（ISBN一致を優先）
      if (openBDResult.title && openBDResult.title !== '不明なタイトル') {
        rakutenCoverImage = await searchRakutenBooksCoverByTitle(
          openBDResult.title,
          normalizedISBN
        )
      }
    }
    return {
      ...openBDResult,
      image:
        openBDResult.image && openBDResult.image !== NO_IMAGE
          ? openBDResult.image
          : rakutenCoverImage || NO_IMAGE,
    }
  }

  // 2. openBDで見つからない場合、Software DesignのISBNならタイトルなしで検索
  if (isSoftwareDesignISBN(normalizedISBN)) {
    const softwareDesignResult = await searchSoftwareDesign(normalizedISBN)
    if (softwareDesignResult) {
      if (!softwareDesignResult.image) {
        rakutenCoverImage =
          rakutenCoverImage || (await searchRakutenBooksCover(normalizedISBN))
      }
      return {
        ...softwareDesignResult,
        image: softwareDesignResult.image || rakutenCoverImage || NO_IMAGE,
      }
    }
  }

  rakutenCoverImage =
    rakutenCoverImage || (await searchRakutenBooksCover(normalizedISBN))
  if (rakutenCoverImage) {
    return {
      id: normalizedISBN,
      title: '不明なタイトル',
      author: '著者不明',
      category: '未分類',
      image: rakutenCoverImage,
      memo: '',
      isbn: normalizedISBN,
    }
  }

  return undefined
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
