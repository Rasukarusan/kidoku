import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/libs/prisma'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
      return session
    },
  },
}
export default NextAuth(authOptions)
