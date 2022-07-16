import { SheetPage } from '@/features/sheet/components/SheetPage'
export default SheetPage

type Props = { params: { year: number } }
export const getStaticProps = async ({ params }: Props) => {
  const res = await fetch(
    `https://script.google.com/macros/s/AKfycbyzbS-EjeIUIbEj7ErGlDyTcB8Ckh4n5HCgBQK7nYWiD8dC1Ah4zoEyx6RytCns_zb7/exec?year=${params.year}`
  )
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
