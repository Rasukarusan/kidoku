import { gql } from '@apollo/client'

export interface Quote {
  id: string
  bookId: number
  page: number | null
  text: string
  comment: string | null
  created: string
}

export interface MyQuote extends Quote {
  bookTitle: string
  bookAuthor: string
  bookImage: string
}

export const bookQuotesQuery = gql`
  query BookQuotes($input: GetBookQuotesInput!) {
    bookQuotes(input: $input) {
      id
      bookId
      page
      text
      comment
      created
    }
  }
`

export const myQuotesQuery = gql`
  query MyQuotes {
    myQuotes {
      id
      bookId
      page
      text
      comment
      created
      bookTitle
      bookAuthor
      bookImage
    }
  }
`

export const createQuoteMutation = gql`
  mutation CreateQuote($input: CreateQuoteInput!) {
    createQuote(input: $input) {
      id
    }
  }
`

export const updateQuoteMutation = gql`
  mutation UpdateQuote($input: UpdateQuoteInput!) {
    updateQuote(input: $input) {
      id
    }
  }
`

export const deleteQuoteMutation = gql`
  mutation DeleteQuote($input: DeleteQuoteInput!) {
    deleteQuote(input: $input)
  }
`
