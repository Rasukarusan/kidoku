import { AiHistoryPage } from '@/features/ai-history/AiHistoryPage'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
export default AiHistoryPage

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: { destination: '/' },
    }
  }
  return { props: {} }
}
