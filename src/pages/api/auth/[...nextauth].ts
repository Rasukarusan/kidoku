import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/libs/prisma'
import type { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import { initUser } from '@/libs/auth/init'

export const authOptions: NextAuthOptions = {
  // @ts-expect-error hoge
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
