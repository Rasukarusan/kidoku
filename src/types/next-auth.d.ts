import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      admin: boolean
    } & DefaultSession['user']
  }
  interface User extends DefaultUser {
    id: string
    admin: boolean
  }
}
