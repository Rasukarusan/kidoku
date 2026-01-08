import { gql } from '@apollo/client'

export const GET_COMMENTS = gql`
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
