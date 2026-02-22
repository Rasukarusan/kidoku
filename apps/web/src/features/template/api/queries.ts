import { gql } from '@apollo/client'

export const templateBooksQuery = gql`
  query TemplateBooks {
    templateBooks {
      id
      name
      title
      author
      category
      image
      memo
      isPublicMemo
      created
      updated
    }
  }
`
