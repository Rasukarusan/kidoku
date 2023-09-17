import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/libs/prisma'
import type { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    //   async signIn({ user, account, profile, email, credentials }) {
    //     console.log('signIn')
    //     console.log(user, account, profile, email, credentials)
    //     return true
    //   },
    async session({ session, user, token }) {
      session.user.id = user.id
      session.user.admin = user.admin
      return session
    },
  },
}
export default NextAuth(authOptions)
