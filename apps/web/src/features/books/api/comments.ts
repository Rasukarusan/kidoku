import { gql } from '@apollo/client'

export const bookCommentsQuery = gql`
  query BookComments($input: GetBookCommentsInput!) {
    bookComments(input: $input) {
      comments {
        id
        bookId
        userId
        content
        created
        updated
        username
        userImage
      }
      hasMore
      total
    }
  }
`

export const createBookCommentMutation = gql`
  mutation CreateBookComment($input: CreateBookCommentInput!) {
    createBookComment(input: $input) {
      id
      bookId
      userId
      content
      created
      updated
      username
      userImage
    }
  }
`

export const deleteBookCommentMutation = gql`
  mutation DeleteBookComment($input: DeleteBookCommentInput!) {
    deleteBookComment(input: $input)
  }
`
