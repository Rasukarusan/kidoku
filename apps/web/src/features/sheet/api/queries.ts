import { gql } from '@apollo/client'

export const GET_SHEETS = gql`
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
