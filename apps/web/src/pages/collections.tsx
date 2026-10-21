import type { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
export default function CollectionsRedirect() {
  return null
}
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await getServerSession(req, res, authOptions)
  return {
    redirect: {
      destination: session?.user.name
        ? `/${encodeURIComponent(session.user.name)}/collections`
        : '/',
      permanent: false,
    },
  }
}
