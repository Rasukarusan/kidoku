import { gql } from '@apollo/client'

export const getCommentsQuery = gql`
  query GetComments($input: GetCommentsInput!) {
    comments(input: $input) {
      comments {
        id
        title
        memo
        image
        updated
        username
        userImage
        sheet
      }
      hasMore
      total
    }
  }
`
