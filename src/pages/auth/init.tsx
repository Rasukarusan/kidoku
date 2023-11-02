import { AuthInitPage } from '@/features/auth/AuthInitPage'
export default AuthInitPage

import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next'
import { getProviders, signIn } from 'next-auth/react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  // const session = await getServerSession(ctx.req, ctx.res, authOptions)
  // if (session.user.email) {
  //   return {
  //     redirect: { destination: '/' },
  //   }
  // }
  const providers = await getProviders()
  return {
    props: { providers: providers ?? [] },
  }
}
