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
