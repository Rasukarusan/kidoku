import { gql } from '@apollo/client'

export interface AuthorFollow {
  id: string
  authorName: string
}

export interface AuthorNewRelease {
  id: string
  title: string
  author: string
  category: string
  image: string
  salesDate: string | null
}

export const followedAuthorsQuery = gql`
  query FollowedAuthors {
    followedAuthors {
      id
      authorName
    }
  }
`

export const authorNewReleasesQuery = gql`
  query AuthorNewReleases($input: GetAuthorNewReleasesInput!) {
    authorNewReleases(input: $input) {
      id
      title
      author
      category
      image
      salesDate
    }
  }
`

export const followAuthorMutation = gql`
  mutation FollowAuthor($input: FollowAuthorInput!) {
    followAuthor(input: $input) {
      id
      authorName
    }
  }
`

export const unfollowAuthorMutation = gql`
  mutation UnfollowAuthor($input: UnfollowAuthorInput!) {
    unfollowAuthor(input: $input)
  }
`
