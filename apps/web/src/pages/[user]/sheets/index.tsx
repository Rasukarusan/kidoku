import { readSheets } from '@kidoku/reading-store'
import prisma from '@/libs/prisma'
import { SheetPage } from '@/features/sheet/components/SheetPage'
export default SheetPage

export async function getServerSideProps(context) {
  const { user: username } = context.params
  const sheets = await readSheets(prisma, {
    where: { user: { name: username } },
    orderBy: [
      {
        position: 'desc',
      },
    ],
  })
  if (sheets.length === 0) {
    return {
      redirect: { destination: `/${username}/sheets/total` },
    }
  }
  return {
    redirect: {
      destination: `/${username}/sheets/${encodeURIComponent(sheets[0].name)}`,
    },
  }
}
