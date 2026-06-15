import { gql } from '@apollo/client'

export const popularBooksQuery = gql`
  query PopularBooks($limit: Int) {
    popularBooks(limit: $limit) {
      id
      title
      author
      image
      username
      userImage
      sheet
      likeCount
    }
  }
`

export const topReadersQuery = gql`
  query TopReaders($limit: Int) {
    topReaders(limit: $limit) {
      name
      image
      bookCount
    }
  }
`

export const myLikedBookIdsQuery = gql`
  query MyLikedBookIds {
    myLikedBookIds
  }
`

export const followInfoQuery = gql`
  query FollowInfo($input: GetFollowInfoInput!) {
    followInfo(input: $input) {
      followers
      following
      isFollowing
    }
  }
`

export const feedQuery = gql`
  query Feed($input: GetFeedInput!) {
    feed(input: $input) {
      books {
        id
        title
        author
        memo
        image
        updated
        username
        userImage
        sheet
        likeCount
      }
      hasMore
      total
    }
  }
`

export const notificationsQuery = gql`
  query Notifications($input: GetNotificationsInput!) {
    notifications(input: $input) {
      notifications {
        id
        type
        bookId
        read
        created
        actorName
        actorImage
        bookTitle
      }
      hasMore
      total
    }
  }
`

export const unreadNotificationCountQuery = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`
