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

export const CREATE_SHEET = gql`
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

export const UPDATE_SHEET = gql`
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

export const DELETE_SHEET = gql`
  mutation DeleteSheet($input: DeleteSheetInput!) {
    deleteSheet(input: $input)
  }
`
