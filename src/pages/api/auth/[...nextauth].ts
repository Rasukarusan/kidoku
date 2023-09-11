import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  // callbacks: {
  //   async signIn({ user, account, profile, email, credentials }) {
  //     console.log('signIn')
  //     console.log(user, account, profile, email, credentials)
  //     return true
  //   },
  //   async session({ session, user, token }) {
  //     console.log(session)
  //     session.user.id = 1
  //     return session
  //   },
  // },
})
