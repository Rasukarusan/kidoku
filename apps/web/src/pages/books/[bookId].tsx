import type { GetServerSideProps } from 'next'
import prisma from '@/libs/prisma'
export default function LegacyBookRedirect() {
  return null
}
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = Number(params.bookId)
  if (!Number.isSafeInteger(id) || id <= 0) return { notFound: true }
  const item = await prisma.item.findUnique({
    where: { id },
    select: { itemTypeId: true },
  })
  return item?.itemTypeId === 'book'
    ? { redirect: { destination: `/items/${id}`, permanent: true } }
    : { notFound: true }
}
