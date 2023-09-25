export type YearlyTopBook = {
  year: string
  order: number
  book: {
    id: number
    title: string
    author: string
    image: string
  }
}
