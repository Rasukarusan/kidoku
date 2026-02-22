import { gql } from '@apollo/client'

export const userImageQuery = gql`
  query UserImage($input: GetUserImageInput!) {
    userImage(input: $input)
  }
`

export const isNameAvailableQuery = gql`
  query IsNameAvailable($input: CheckNameAvailableInput!) {
    isNameAvailable(input: $input)
  }
`
