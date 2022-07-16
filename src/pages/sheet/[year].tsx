import { SheetPage } from '@/features/sheet/components/SheetPage'
export default SheetPage

type Props = { params: { year: number } }
export const getStaticProps = async ({ params }: Props) => {
  const host =
    'https://script.google.com/macros/s/AKfycbysWI09TGg0c72WkK8AvwA5D_f3CHG9olPlwxcfzi0qMyYEwEVA_c62n19f-zFMnkKG/exec'
  const res = await fetch(host + `?year=${params.year}`)
  const data = await res.json()
  return {
    props: {
      data,
      year: params.year.toString(),
    },
    revalidate: 60 * 60 * 24,
  }
}

export const getStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking', // キャッシュが存在しない場合はSSR
})
