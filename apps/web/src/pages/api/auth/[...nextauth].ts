import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { randomStr } from '@/utils/string'
import { initUser } from '@/libs/auth/init'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { SignJWT } from 'jose'

const isEdge =
  process.env.NEXT_RUNTIME === 'edge' ||
  process.env.NEXT_PUBLIC_USE_EDGE === 'true'

const prisma = isEdge
  ? // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@/libs/prisma/edge').default
  : // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@/libs/prisma').default

const JWT_SECRET = process.env.NEXTAUTH_SECRET // Nest と共有

export const authOptions: NextAuthOptions = {
  // TODO: サーバー側で無効化できるようにDB管理にする
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30日間
  },
  secret: JWT_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: 'select_account' } },
      profile: async (profile) => {
        const duplicated = await prisma.user.findUnique({
          where: { name: profile.name },
        })
        return {
          id: profile.sub,
          name: duplicated ? profile.name + '_' + randomStr(4) : profile.name,
          email: profile.email,
          image: profile.picture,
          admin: false,
        }
      },
    }),
  ],

  callbacks: {
    /* 1. JWT ペイロードに userId / admin を埋め込む */
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.admin = user.admin
      }
      return token
    },

    /* 2. session.accessToken に“署名済み JWT 文字列”を格納 */
    async session({ session, token }) {
      // ユーザ情報を流し込む
      if (session.user) {
        session.user.id = token.userId as string
        session.user.admin = token.admin as boolean
      }

      /* ★ ここで JWS を手動生成 */
      const jws = await new SignJWT({
        userId: token.userId,
        admin: token.admin,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30m')
        .sign(new TextEncoder().encode(JWT_SECRET))

      session.accessToken = jws // ← ３区切りの HS256 JWS

      return session
    },
  },

  events: {
    createUser: async ({ user }) => {
      await initUser(user) // 初回ユーザ作成ロジック
    },
  },
}

export default NextAuth(authOptions)
