import { AuthInitPage } from '@/features/auth/AuthInitPage'
export default AuthInitPage

import type { GetServerSidePropsContext } from 'next'
import { getProviders } from 'next-auth/react'

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
