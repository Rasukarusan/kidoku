import { SheetTotalPage } from '@/features/sheet/components/SheetTotalPage'
import { Record as IRecord } from '@/features/sheet/types'
import { getYears } from '@/features/sheet/util'
export default SheetTotalPage

const getAll = async () => {
  const years = getYears()

  return await Promise.all(
    years.map(async (year) => {
      const host =
        'https://script.google.com/macros/s/AKfycbysWI09TGg0c72WkK8AvwA5D_f3CHG9olPlwxcfzi0qMyYEwEVA_c62n19f-zFMnkKG/exec'
      const res = await fetch(host + `?year=${year}`)
      const data = await res.json()
      for (let i = 0; i < data.length; i++) {
        data[i]['year'] = year
      }
      return data
    })
  )
}

type Props = Record<string, IRecord>
export const getStaticProps = async () => {
  const res = await getAll()
  return {
    props: {
      res: res.flat(),
    },
    revalidate: 60 * 60 * 24,
  }
}
