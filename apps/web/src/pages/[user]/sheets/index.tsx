import type { GetServerSideProps } from 'next'
export default function LegacySheetsRedirect() {
  return null
}
export const getServerSideProps: GetServerSideProps = async ({ params }) => ({
  redirect: {
    destination: `/${encodeURIComponent(String(params.user))}/collections`,
    permanent: true,
  },
})
