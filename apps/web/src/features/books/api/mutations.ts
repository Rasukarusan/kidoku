import { gql } from '@apollo/client'

/** メモだけを更新する（他の項目は変更しない） */
export const updateBookMemoMutation = gql`
  mutation UpdateBookMemo($input: UpdateBookInput!) {
    updateBook(input: $input) {
      id
      memo
    }
  }
`
