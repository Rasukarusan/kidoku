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

export const UPDATE_SHEET_ORDERS = gql`
  mutation UpdateSheetOrders($input: UpdateSheetOrdersInput!) {
    updateSheetOrders(input: $input)
  }
`

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
