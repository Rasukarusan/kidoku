import type { GetServerSideProps } from 'next'
import { CollectionPage } from '@/features/collections/CollectionPage'
import { publicWorkspace } from '@/libs/collections/public'
export default CollectionPage
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const id = Number(params.collectionId)
  if (!Number.isSafeInteger(id) || id <= 0) return { notFound: true }
  const data = await publicWorkspace(String(params.user))
  return data?.collections.some((collection) => collection.id === id)
    ? { props: { ...data, collectionId: id } }
    : { notFound: true }
}
