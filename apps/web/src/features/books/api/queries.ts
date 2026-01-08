import { gql } from '@apollo/client'

export const getBookQuery = gql`
  query GetBook($input: GetBookInput!) {
    book(input: $input) {
      id
      userId
      sheetId
      title
      author
      category
      image
      impression
      memo
      isPublicMemo
      isPurchasable
      finished
      created
      updated
    }
  }
`

export const getBooksQuery = gql`
  query GetBooks($input: GetBooksInput) {
    books(input: $input) {
      id
      userId
      sheetId
      title
      author
      category
      image
      impression
      memo
      isPublicMemo
      isPurchasable
      finished
      created
      updated
    }
  }
`

export const getBookCategoriesQuery = gql`
  query GetBookCategories {
    bookCategories
  }
`
