import type { GetServerSideProps } from 'next'
import { ItemDetail } from '@/features/collections/ItemDetail'
import { publicItemPage } from '@/libs/collections/public'
export default ItemDetail
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = Number(params.itemId)
  if (!Number.isSafeInteger(id) || id <= 0) return { notFound: true }
  const data = await publicItemPage(id)
  return data ? { props: data } : { notFound: true }
}
