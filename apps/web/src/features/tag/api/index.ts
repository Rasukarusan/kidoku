import { gql } from '@apollo/client'

export interface TagWithCount {
  id: number
  name: string
  bookCount: number
}

export interface TaggedBook {
  id: number
  title: string
  author: string
  category: string
  image: string
  impression: string
  sheetName: string
  finished: string | null
}

export const myTagsQuery = gql`
  query MyTags {
    myTags {
      id
      name
      bookCount
    }
  }
`

export const bookTagsQuery = gql`
  query BookTags($input: GetBookTagsInput!) {
    bookTags(input: $input)
  }
`

export const booksByTagQuery = gql`
  query BooksByTag($input: GetBooksByTagInput!) {
    booksByTag(input: $input) {
      id
      title
      author
      category
      image
      impression
      sheetName
      finished
    }
  }
`

export const setBookTagsMutation = gql`
  mutation SetBookTags($input: SetBookTagsInput!) {
    setBookTags(input: $input)
  }
`
