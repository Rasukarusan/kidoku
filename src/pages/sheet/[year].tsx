import { SheetPage } from '@/features/sheet/components/SheetPage'
import { getYears } from '@/features/sheet/util'
import { GAS_ENDPOINT } from '@/libs/constants'
export default SheetPage

type Props = { params: { year: number } }
export const getStaticProps = async ({ params }: Props) => {
  const res = await fetch(GAS_ENDPOINT + `?year=${params.year}`)
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
