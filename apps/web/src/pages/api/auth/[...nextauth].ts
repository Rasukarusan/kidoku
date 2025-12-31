import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import { initUser } from '@/libs/auth/init'
import { randomStr } from '@/utils/string'

const isEdge =
  process.env.NEXT_RUNTIME === 'edge' ||
  process.env.NEXT_PUBLIC_USE_EDGE === 'true'

const prisma = isEdge
  ? // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@/libs/prisma/edge').default
  : // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@/libs/prisma').default

// 裏口ログインが有効かどうか
const isBackdoorEnabled = process.env.ENABLE_BACKDOOR_LOGIN === 'true'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: 'select_account',
        },
      },
      profile: async (profile) => {
        // ユーザー名が重複している場合、ランダムな文字列を付与する
        const user = await prisma.user.findUnique({
          where: { name: profile.name },
        })
        return {
          id: profile.sub,
          name: user ? profile.name + '_' + randomStr(4) : profile.name,
          email: profile.email,
          image: profile.picture,
          admin: false,
        }
      },
    }),
    // 裏口ログイン（プレビュー環境での検証用）
    ...(isBackdoorEnabled
      ? [
          CredentialsProvider({
            id: 'backdoor',
            name: 'Backdoor Login',
            credentials: {
              email: { label: 'Email', type: 'email' },
              password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
              if (!credentials?.email || !credentials?.password) {
                return null
              }

              // 環境変数で設定されたメールアドレスとパスワードをチェック
              if (
                credentials.email === process.env.BACKDOOR_USER_EMAIL &&
                credentials.password === process.env.BACKDOOR_USER_PASSWORD
              ) {
                // メールアドレスで既存ユーザーを検索
                let user = await prisma.user.findUnique({
                  where: { email: credentials.email },
                })

                // ユーザーが存在しない場合、新規作成
                if (!user) {
                  user = await prisma.user.create({
                    data: {
                      email: credentials.email,
                      name: 'Test User',
                      admin: false,
                    },
                  })
                  // 初期データを作成
                  await initUser({ id: user.id } as any)
                }

                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  image: user.image,
                }
              }

              return null
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, user, token }) {
      // CredentialsProvider使用時はtokenからデータを取得
      if (token) {
        session.user.id = token.sub as string
        session.user.admin = (token.admin as boolean) || false
      } else if (user) {
        // GoogleProvider使用時はuserからデータを取得
        session.user.id = user.id
        session.user.admin = user.admin
      }
      return session
    },
    async jwt({ token, user }) {
      // 初回サインイン時にuserデータをtokenに保存
      if (user) {
        token.admin = user.admin
      }
      return token
    },
  },
  // CredentialsProviderを使う場合はJWT戦略が必要
  session: {
    strategy: isBackdoorEnabled ? 'jwt' : 'database',
  },
  events: {
    createUser: async (user) => {
      await initUser(user.user)
    },
  },
}
export default NextAuth(authOptions)
