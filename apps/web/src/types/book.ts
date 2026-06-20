type month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Month = `${month}月`

export interface Book {
  id: number
  userId: string
  month: Month
  title: string
  author: string
  category: string
  image: string
  impression: string // 感想 ex.) ◎
  memo: string
  finished: string
  isPublicMemo: boolean
  isPurchasable: boolean
  /** 購入価格（MIST単位の文字列）。null/未設定の場合はグローバル既定額を用いる */
  price?: string | null
  sheetId?: number
  sheet?: string
  likeCount?: number
  user?: {
    id: string
    name: string
    image: string
  }
}

export type YearlyTopBook = {
  year: string
  order: number
  book: {
    id: number
    title: string
    author: string
    image: string
    memo: string
    isPublicMemo: boolean
  }
}
