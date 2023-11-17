import { PrivacyPage } from '@/features/privacy/components/PrivacyPage'

export default PrivacyPage

export const getStaticProps = async (ctx) => {
  return {
    props: {},
    revalidate: 300,
  }
}
