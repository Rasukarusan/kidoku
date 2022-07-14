import { SheetPage } from '@/features/sheet/components/SheetPage'
export default SheetPage

type Props = { params: { year: number } }
export const getStaticProps = async ({ params }: Props) => {
  const res = await fetch(
    `https://script.google.com/macros/s/AKfycbz8OBp3KeE9cY4ZEi0qK18tL2maoTSjwm86SRXjaywGs-8X-84sef_Db01jFQ9JUzWw/exec?year=${params.year}`
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
