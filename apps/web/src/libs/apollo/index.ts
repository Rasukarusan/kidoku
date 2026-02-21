import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
  concat,
} from '@apollo/client'

// GraphQLエンドポイントの決定
// サーバーサイドでは絶対URLが必要、クライアントサイドでは相対URLで良い
const getGraphQLEndpoint = () => {
  if (typeof window === 'undefined') {
    // サーバーサイド
    const host = process.env.NEXT_PUBLIC_HOST || 'http://localhost:3000'
    return `${host}/api/graphql`
  } else {
    // クライアントサイド
    return '/api/graphql'
  }
}

// HttpLinkの作成
// Network TABでoperationNameが見えるようにURIを動的に生成
const httpLink = new HttpLink({
  uri: (operation) => {
    const endpoint = getGraphQLEndpoint()
    const operationName = operation.operationName
    return operationName
      ? `${endpoint}?operationName=${operationName}`
      : endpoint
  },
  credentials: 'same-origin', // 同一オリジンでクッキーを送信
})

// 認証ミドルウェア
// NextAuthのセッションはクッキーで管理されており、
// /api/graphqlプロキシ側でセッション情報を取得して認証ヘッダーを付与するため、
// ここでは特別な認証処理は不要
const authMiddleware = new ApolloLink((operation, forward) => {
  // 必要に応じて他のヘッダーを設定できる
  return forward(operation)
})

// Apollo Clientの作成
const createApolloClient = () => {
  return new ApolloClient({
    link: concat(authMiddleware, httpLink),
    cache: new InMemoryCache(),
    ssrMode: typeof window === 'undefined', // SSRモードの自動検出
  })
}

// シングルトンパターンでクライアントを管理
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let apolloClient: ApolloClient<any> | null = null

const getApolloClient = () => {
  if (!apolloClient) {
    apolloClient = createApolloClient()
  }
  return apolloClient
}

export default getApolloClient()
export { createApolloClient, getApolloClient }
