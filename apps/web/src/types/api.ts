export interface CategoriesResponse {
  result: boolean
  categories: string[]
}

export interface Template {
  id: number
  name: string
  title: string
  author: string
  image: string
  category: string
  memo: string
  is_public_memo: boolean
}

export interface TemplatesResponse {
  result: boolean
  templates: Template[]
}

export interface SearchHit {
  id: number
  title: string
  memo: string
  image: string
  username: string
  userImage: string
  sheet: string
}

export interface SearchResponse {
  hits: SearchHit[]
  next: boolean
}

export interface AiSummaryUsageResponse {
  count: number
}

export interface BooksResponse {
  result: boolean
  books: import('./book').Book[]
}

export interface UserImageResponse {
  image: string
}

export interface YearlyTopBooksResponse {
  result: boolean
  yearlyTopBooks: import('./book').YearlyTopBook[]
}
