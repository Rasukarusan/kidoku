import { Book } from '@/types/book'

export interface TotalRecord extends Book {
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
