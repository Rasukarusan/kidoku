import { SheetTotalPage } from '@/features/sheet/components/SheetTotalPage'
import { getYears } from '@/features/sheet/util'
export default SheetTotalPage

export const getStaticProps = async () => {
  const years = getYears()
  getYears().forEach(async (year) => {
    const host =
      'https://script.google.com/macros/s/AKfycbysWI09TGg0c72WkK8AvwA5D_f3CHG9olPlwxcfzi0qMyYEwEVA_c62n19f-zFMnkKG/exec'
    const res = await fetch(host + `?year=${year}`)
    const data = await res.json()
    console.log(data)
  })
  return {
    props: {},
    revalidate: 60 * 60 * 24,
  }
}
