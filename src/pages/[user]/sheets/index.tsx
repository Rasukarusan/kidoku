import prisma from '@/libs/prisma'
import { SheetPage } from '@/features/sheet/components/SheetPage'
export default SheetPage

export async function getServerSideProps(context) {
  const { user: username } = context.params
  const sheets = await prisma.sheets.findMany({
    where: { user: { name: username } },
    select: {
      name: true,
      user: { select: { name: true } },
    },
    orderBy: [
      {
        order: 'desc',
      },
    ],
  })
  if (sheets.length === 0) {
    return {
      redirect: { destination: `/${username}/sheets/total` },
    }
  }
  return {
    redirect: { destination: `/${username}/sheets/${sheets[0].name}` },
  }
}
