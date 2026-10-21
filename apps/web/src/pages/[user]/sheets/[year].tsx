import type { GetServerSideProps } from 'next'
import prisma from '@/libs/prisma'
export default function LegacySheetRedirect() {
  return null
}
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const collection = await prisma.collection.findFirst({
    where: { user: { name: String(params.user) }, name: String(params.year) },
    select: { id: true },
  })
  return collection
    ? {
        redirect: {
          destination: `/${encodeURIComponent(String(params.user))}/collections/${collection.id}`,
          permanent: true,
        },
      }
    : { notFound: true }
}
