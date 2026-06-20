import { gql } from '@apollo/client'

export const updateUserNameMutation = gql`
  mutation UpdateUserName($input: UpdateUserNameInput!) {
    updateUserName(input: $input) {
      name
    }
  }
`

export const updateSuiAddressMutation = gql`
  mutation UpdateSuiAddress($input: UpdateSuiAddressInput!) {
    updateSuiAddress(input: $input) {
      name
      suiAddress
    }
  }
`

export const deleteUserMutation = gql`
  mutation DeleteUser {
    deleteUser
  }
`
