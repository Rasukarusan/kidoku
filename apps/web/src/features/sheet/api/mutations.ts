import { gql } from '@apollo/client'

export const createSheetMutation = gql`
  mutation CreateSheet($input: CreateSheetInput!) {
    createSheet(input: $input) {
      id
      name
      order
      created
      updated
    }
  }
`

export const updateSheetMutation = gql`
  mutation UpdateSheet($input: UpdateSheetInput!) {
    updateSheet(input: $input) {
      id
      name
      order
      created
      updated
    }
  }
`

export const deleteSheetMutation = gql`
  mutation DeleteSheet($input: DeleteSheetInput!) {
    deleteSheet(input: $input)
  }
`

export const updateSheetOrdersMutation = gql`
  mutation UpdateSheetOrders($input: UpdateSheetOrdersInput!) {
    updateSheetOrders(input: $input)
  }
`

export const upsertYearlyTopBookMutation = gql`
  mutation UpsertYearlyTopBook($input: UpsertYearlyTopBookInput!) {
    upsertYearlyTopBook(input: $input)
  }
`

export const deleteYearlyTopBookMutation = gql`
  mutation DeleteYearlyTopBook($input: DeleteYearlyTopBookInput!) {
    deleteYearlyTopBook(input: $input)
  }
`

export const deleteAiSummaryMutation = gql`
  mutation DeleteAiSummary($input: DeleteAiSummaryInput!) {
    deleteAiSummary(input: $input) {
      deletedCount
    }
  }
`

export const saveAiSummaryMutation = gql`
  mutation SaveAiSummary($input: SaveAiSummaryInput!) {
    saveAiSummary(input: $input)
  }
`
