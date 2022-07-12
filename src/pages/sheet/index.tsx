import { SheetPage } from '@/features/sheet/components/SheetPage'
export default SheetPage

export async function getServerSideProps(context) {
  const { year = '2022' } = context.query
  const res = await fetch(
    `https://script.google.com/macros/s/AKfycbz8OBp3KeE9cY4ZEi0qK18tL2maoTSjwm86SRXjaywGs-8X-84sef_Db01jFQ9JUzWw/exec?year=${year}`
  )
  const data = await res.json()
  return {
    props: {
      data,
    },
  }
}
