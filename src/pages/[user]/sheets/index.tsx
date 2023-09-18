import prisma from '@/libs/prisma'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { getServerSession } from 'next-auth/next'
import { SheetPage } from '@/features/sheet/components/SheetPage'
export default SheetPage

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      redirect: { destination: '/' },
    }
  }
  const userId = session.user.id
  const sheets = await prisma.sheets.findMany({
    where: { userId },
    orderBy: [
      {
        order: 'desc',
      },
    ],
  })
  if (sheets.length === 0) {
    return {
      redirect: { destination: '/' },
    }
  }
  return {
    redirect: { destination: `/${session.user.name}/sheets/${sheets[0].name}` },
  }
}
