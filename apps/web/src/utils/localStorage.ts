import type { SearchResult } from '@/types/search'

/**
 * ローカルストレージのキー定義
 */
const STORAGE_KEYS = {
  BOOK_DRAFT: 'kidoku_book_draft',
  BOOK_REGISTER_DRAFT: 'kidoku_book_register_draft',
} as const

/**
 * 書籍の編集中データ型
 */
export interface BookDraftData {
  bookId: string
  memo?: string
  impression?: string
  category?: string
  finished?: string
  title?: string
  author?: string
  isPublicMemo?: boolean
  isPurchasable?: boolean
  price?: string | null
  timestamp: number // 保存日時
}

/**
 * ローカルストレージから書籍の下書きデータを取得
 */
export const getBookDraft = (bookId: string): BookDraftData | null => {
  if (typeof window === 'undefined') return null

  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOK_DRAFT)
    if (!data) return null

    const drafts: Record<string, BookDraftData> = JSON.parse(data)
    const draft = drafts[bookId]

    // 24時間以上経過した下書きは削除
    if (draft && Date.now() - draft.timestamp > 24 * 60 * 60 * 1000) {
      removeBookDraft(bookId)
      return null
    }

    return draft || null
  } catch (error) {
    console.error('Failed to get book draft from localStorage:', error)
    return null
  }
}

/**
 * ローカルストレージに書籍の下書きデータを保存
 */
export const saveBookDraft = (
  bookId: string,
  draftData: Partial<BookDraftData>
): void => {
  if (typeof window === 'undefined') return

  try {
    const existing = localStorage.getItem(STORAGE_KEYS.BOOK_DRAFT)
    const drafts: Record<string, BookDraftData> = existing
      ? JSON.parse(existing)
      : {}

    drafts[bookId] = {
      ...drafts[bookId],
      ...draftData,
      bookId,
      timestamp: Date.now(),
    }

    localStorage.setItem(STORAGE_KEYS.BOOK_DRAFT, JSON.stringify(drafts))
  } catch (error) {
    console.error('Failed to save book draft to localStorage:', error)
  }
}

/**
 * ローカルストレージから書籍の下書きデータを削除
 */
export const removeBookDraft = (bookId: string): void => {
  if (typeof window === 'undefined') return

  try {
    const existing = localStorage.getItem(STORAGE_KEYS.BOOK_DRAFT)
    if (!existing) return

    const drafts: Record<string, BookDraftData> = JSON.parse(existing)
    delete drafts[bookId]

    if (Object.keys(drafts).length === 0) {
      localStorage.removeItem(STORAGE_KEYS.BOOK_DRAFT)
    } else {
      localStorage.setItem(STORAGE_KEYS.BOOK_DRAFT, JSON.stringify(drafts))
    }
  } catch (error) {
    console.error('Failed to remove book draft from localStorage:', error)
  }
}

/**
 * すべての古い下書きデータをクリーンアップ（24時間以上経過）
 */
export const cleanupOldDrafts = (): void => {
  if (typeof window === 'undefined') return

  try {
    const existing = localStorage.getItem(STORAGE_KEYS.BOOK_DRAFT)
    if (!existing) return

    const drafts: Record<string, BookDraftData> = JSON.parse(existing)
    const now = Date.now()
    const cleanedDrafts: Record<string, BookDraftData> = {}

    Object.entries(drafts).forEach(([bookId, draft]) => {
      if (now - draft.timestamp <= 24 * 60 * 60 * 1000) {
        cleanedDrafts[bookId] = draft
      }
    })

    if (Object.keys(cleanedDrafts).length === 0) {
      localStorage.removeItem(STORAGE_KEYS.BOOK_DRAFT)
    } else {
      localStorage.setItem(
        STORAGE_KEYS.BOOK_DRAFT,
        JSON.stringify(cleanedDrafts)
      )
    }
  } catch (error) {
    console.error('Failed to cleanup old drafts:', error)
  }
}

/**
 * 本登録モーダルの入力中データ型
 *
 * 既存本の編集（BookDraftData）とは異なり、まだDBに登録されていない本のための
 * 下書き。登録フローは同時に1冊しか進行しないため、bookIdではなく単一スロットで保持する。
 */
export interface BookRegisterDraftData {
  /** 選択中の検索結果（登録ビューを復元するために保持） */
  item: SearchResult
  /** フォームの入力値 */
  book: Record<string, unknown>
  /** 保存先シート */
  sheet?: { id: number | null; name: string | null }
  timestamp: number // 保存日時
}

/**
 * ローカルストレージから本登録の下書きデータを取得
 */
export const getBookRegisterDraft = (): BookRegisterDraftData | null => {
  if (typeof window === 'undefined') return null

  try {
    const data = localStorage.getItem(STORAGE_KEYS.BOOK_REGISTER_DRAFT)
    if (!data) return null

    const draft: BookRegisterDraftData = JSON.parse(data)

    // 24時間以上経過した下書きは削除
    if (draft && Date.now() - draft.timestamp > 24 * 60 * 60 * 1000) {
      removeBookRegisterDraft()
      return null
    }

    return draft || null
  } catch (error) {
    console.error('Failed to get book register draft from localStorage:', error)
    return null
  }
}

/**
 * ローカルストレージに本登録の下書きデータを保存
 */
export const saveBookRegisterDraft = (
  draft: Omit<BookRegisterDraftData, 'timestamp'>
): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(
      STORAGE_KEYS.BOOK_REGISTER_DRAFT,
      JSON.stringify({ ...draft, timestamp: Date.now() })
    )
  } catch (error) {
    console.error('Failed to save book register draft to localStorage:', error)
  }
}

/**
 * ローカルストレージから本登録の下書きデータを削除
 */
export const removeBookRegisterDraft = (): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEYS.BOOK_REGISTER_DRAFT)
  } catch (error) {
    console.error(
      'Failed to remove book register draft from localStorage:',
      error
    )
  }
}
