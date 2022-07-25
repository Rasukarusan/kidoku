type month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Month = `${month}月`

export interface Record {
  month: Month
  title: string
  author: string
  category: string
  image: string
  impression: string // 感想 ex.) ◎
  memo: string
}
