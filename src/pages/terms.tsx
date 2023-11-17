import { TermsPage } from '@/features/terms/components/TermsPage'

export default TermsPage

export const getStaticProps = async (ctx) => {
  return {
    props: {},
    revalidate: 300,
  }
}
