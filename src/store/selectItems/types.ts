import { Item } from '@/types/search'

export interface Results {
  [key: string]: Item[] // keyは検索単語
}

export type SelectItems = Item[]
