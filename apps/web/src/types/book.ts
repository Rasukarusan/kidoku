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
  is_public_memo: boolean
  is_purchasable: boolean
  sheet_id?: number
  sheet?: string
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
    is_public_memo: boolean
  }
}
