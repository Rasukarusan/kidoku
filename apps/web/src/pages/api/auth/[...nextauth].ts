import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
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
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      session.user.admin = user.admin
      return session
    },
  },
  events: {
    createUser: async (user) => {
      await initUser(user.user)
    },
  },
}
export default NextAuth(authOptions)
