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

export const getYearlyTopBooksQuery = gql`
  query YearlyTopBooks($input: GetYearlyTopBooksInput!) {
    yearlyTopBooks(input: $input) {
      year
      order
      book {
        id
        title
        author
        image
      }
    }
  }
`

export const aiSummaryUsageQuery = gql`
  query AiSummaryUsage {
    aiSummaryUsage
  }
`
