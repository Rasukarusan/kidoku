import { gql } from '@apollo/client'

export const likeBookMutation = gql`
  mutation LikeBook($input: LikeBookInput!) {
    likeBook(input: $input)
  }
`

export const unlikeBookMutation = gql`
  mutation UnlikeBook($input: LikeBookInput!) {
    unlikeBook(input: $input)
  }
`

export const followUserMutation = gql`
  mutation FollowUser($input: FollowUserInput!) {
    followUser(input: $input)
  }
`

export const unfollowUserMutation = gql`
  mutation UnfollowUser($input: FollowUserInput!) {
    unfollowUser(input: $input)
  }
`

export const markNotificationsReadMutation = gql`
  mutation MarkNotificationsRead {
    markNotificationsRead
  }
`
