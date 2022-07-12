export interface Record {
  title: string
  author: string
  category: string
  impression: string // 感想 ex.) ◎
  memo: string
}

type month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Month = `${month}月`
export type ReadingRecord = { [key in Month]: Record }
