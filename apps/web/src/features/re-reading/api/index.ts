import { gql } from '@apollo/client'

export interface ReReading {
  id: string
  bookId: number
  finished: string
  memo: string | null
}

export const bookReReadingsQuery = gql`
  query BookReReadings($input: GetBookReReadingsInput!) {
    bookReReadings(input: $input) {
      id
      bookId
      finished
      memo
    }
  }
`

export const createReReadingMutation = gql`
  mutation CreateReReading($input: CreateReReadingInput!) {
    createReReading(input: $input) {
      id
    }
  }
`

export const deleteReReadingMutation = gql`
  mutation DeleteReReading($input: DeleteReReadingInput!) {
    deleteReReading(input: $input)
  }
`
