type month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Month = `${month}月`

export interface Record {
  id: number
  userId: string
  month: Month
  title: string
  author: string
  category: string
  image: string
  impression: string // 感想 ex.) ◎
  memo: string
}

export interface TotalRecord extends Record {
  year: string
}

export interface Category {
  name: string
  count: number
  percent: number
}

export interface Year {
  year: string
  count: number
}
