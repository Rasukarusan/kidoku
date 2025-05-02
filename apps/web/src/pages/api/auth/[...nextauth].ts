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
  /* ───────────── セッションは署名付き JWT ───────────── */
  session: {
    strategy: 'jwt',
    maxAge: 30 * 60, // 30 分
    updateAge: 10 * 60, // 10 分ごとに再署名
  },
  secret: JWT_SECRET,

  /* ───────────── DB 連携 ───────────── */
  adapter: PrismaAdapter(prisma),

  /* ───────────── プロバイダ ───────────── */
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

  /* ───────────── コールバック ───────────── */
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
        .sign(new TextEncoder().encode(JWT_SECRET)) // ← NEXTAUTH_SECRET と同値

      session.accessToken = jws // ← ３区切りの HS256 JWS

      return session
    },
  },

  /* ───────────── イベント ───────────── */
  events: {
    createUser: async ({ user }) => {
      await initUser(user) // 初回ユーザ作成ロジック
    },
  },
}

export default NextAuth(authOptions)
