import { gql } from '@apollo/client'

export interface RatingAxis {
  id: string
  name: string
  order: number
}

export interface BookRating {
  axisId: number
  axisName: string
  value: number
}

export const ratingAxesQuery = gql`
  query RatingAxes {
    ratingAxes {
      id
      name
      order
    }
  }
`

export const bookRatingsQuery = gql`
  query BookRatings($input: GetBookRatingsInput!) {
    bookRatings(input: $input) {
      axisId
      axisName
      value
    }
  }
`

export const createRatingAxisMutation = gql`
  mutation CreateRatingAxis($input: CreateRatingAxisInput!) {
    createRatingAxis(input: $input) {
      id
      name
      order
    }
  }
`

export const deleteRatingAxisMutation = gql`
  mutation DeleteRatingAxis($input: DeleteRatingAxisInput!) {
    deleteRatingAxis(input: $input)
  }
`

export const setBookRatingMutation = gql`
  mutation SetBookRating($input: SetBookRatingInput!) {
    setBookRating(input: $input)
  }
`
