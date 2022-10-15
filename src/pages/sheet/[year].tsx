import { SheetPage } from '@/features/sheet/components/SheetPage'
import { getYears } from '@/features/sheet/util'
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
  }
}

export const getStaticPaths = async () => {
  const years = getYears()
  const paths = years.map((year) => {
    return { params: { year } }
  })
  return {
    paths,
    fallback: false,
  }
}
