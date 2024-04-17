import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/libs/prisma/edge'
import type { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import { initUser } from '@/libs/auth/init'
import { randomStr } from '@/utils/string'

export const authOptions: NextAuthOptions = {
  // @ts-expect-error hoge
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
    async session({ session, user, token }) {
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
