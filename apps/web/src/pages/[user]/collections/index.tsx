import type { GetServerSideProps } from 'next'
import { CollectionPage } from '@/features/collections/CollectionPage'
import { publicWorkspace } from '@/libs/collections/public'
export default CollectionPage
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const data = await publicWorkspace(String(params.user))
  return data ? { props: data } : { notFound: true }
}
