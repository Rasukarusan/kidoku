import { gql } from '@apollo/client'

export const createBookMutation = gql`
  mutation CreateBook($input: CreateBookInput!) {
    createBook(input: $input) {
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

export const updateBookMutation = gql`
  mutation UpdateBook($input: UpdateBookInput!) {
    updateBook(input: $input) {
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

export const deleteBookMutation = gql`
  mutation DeleteBook($input: DeleteBookInput!) {
    deleteBook(input: $input)
  }
`
