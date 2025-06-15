import { AuthInitPage } from '@/features/auth/AuthInitPage'
export default AuthInitPage

import { getProviders } from 'next-auth/react'

export async function getServerSideProps() {
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
