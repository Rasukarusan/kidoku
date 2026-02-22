import { gql } from '@apollo/client'

export const deleteTemplateBookMutation = gql`
  mutation DeleteTemplateBook($input: DeleteTemplateBookInput!) {
    deleteTemplateBook(input: $input)
  }
`
