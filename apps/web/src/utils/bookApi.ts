import { ApiClient } from '@/libs/apiClient'
import { NO_IMAGE } from '@/libs/constants'
import { SearchResult } from '@/types/search'
import { normalizeISBN, convertISBN10to13 } from './isbn'

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
      image: imageLinks?.thumbnail || imageLinks?.smallThumbnail || NO_IMAGE,
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
      image: summary.cover || NO_IMAGE,
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

  // 1. まずopenBDで検索（日本の書籍データベース）
  const openBDResult = await searchOpenBD(normalizedISBN)
  if (openBDResult && openBDResult.title !== '不明なタイトル') {
    return openBDResult
  }

  // 2. openBDで見つからない場合はGoogle Books APIで検索
  const googleResult = await searchGoogleBooks(normalizedISBN)
  if (googleResult) {
    // openBDの部分的な結果とGoogleの結果をマージ
    if (openBDResult) {
      return {
        ...googleResult,
        // openBDの画像やカテゴリがあれば優先
        image:
          openBDResult.image !== NO_IMAGE
            ? openBDResult.image
            : googleResult.image,
        category:
          openBDResult.category !== '未分類'
            ? openBDResult.category
            : googleResult.category,
      }
    }
    return googleResult
  }

  // 3. どちらでも見つからない場合は部分的な結果でも返す
  return openBDResult || googleResult
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
