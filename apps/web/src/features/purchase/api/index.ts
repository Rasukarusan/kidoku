import { gql } from '@apollo/client'

export const createPurchaseMutation = gql`
  mutation CreatePurchase($input: CreatePurchaseInput!) {
    createPurchase(input: $input) {
      id
      bookId
      txDigest
      network
      amount
      created
    }
  }
`

export const purchasedBookMemoQuery = gql`
  query PurchasedBookMemo($input: GetPurchasedBookMemoInput!) {
    purchasedBookMemo(input: $input)
  }
`

export const bookPaymentRecipientQuery = gql`
  query BookPaymentRecipient($input: GetBookPaymentRecipientInput!) {
    bookPaymentRecipient(input: $input)
  }
`
