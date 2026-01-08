import { gql } from '@apollo/client'

export const getSheetsQuery = gql`
  query GetSheets {
    sheets {
      id
      name
      order
      created
      updated
    }
  }
`
