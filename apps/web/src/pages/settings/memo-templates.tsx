import { MemoTemplatesPage } from '@/features/settings/MemoTemplatesPage'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
export default MemoTemplatesPage

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: { destination: '/' },
    }
  }
  return { props: {} }
}
