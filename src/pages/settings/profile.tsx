import { ProfilePage } from '@/features/settings/ProfilePage'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
export default ProfilePage

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: { destination: '/' },
    }
  }
  const { name, image } = session.user
  return {
    props: { name, image },
  }
}
