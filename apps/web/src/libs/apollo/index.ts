import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  concat,
} from '@apollo/client'

const httpLink = new HttpLink({ uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT })

const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('accessToken') // ここでトークンを取得
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  })
  return forward(operation)
})

const client = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
})

export default client
