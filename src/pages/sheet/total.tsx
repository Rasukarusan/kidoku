import { SheetTotalPage } from '@/features/sheet/components/SheetTotal/SheetTotalPage'
import { Category, Year } from '@/features/sheet/types'
import { getYears } from '@/features/sheet/util'
import { GAS_ENDPOINT } from '@/libs/constants'

export default SheetTotalPage

const getAll = async () => {
  const years = getYears()

  return await Promise.all(
    years.map(async (year) => {
      const res = await fetch(GAS_ENDPOINT + `?year=${year}`)
      const data = await res.json()
      for (let i = 0; i < data.length; i++) {
        data[i]['year'] = year
      }
      return data
    })
  )
}

export const getStaticProps = async () => {
  const res = await getAll().then((res) => res.flat())
  // データの整形。カテゴリ名をKey, 冊数をValueとしたオブジェクトを生成
  const category_count: Record<string, number> = {}
  res.flat().forEach((book) => {
    if (category_count[book.category]) {
      category_count[book.category] = category_count[book.category] + 1
    } else {
      category_count[book.category] = 1
    }
  })
  // カテゴリ配列作成
  const categories: Category[] = []
  Object.keys(category_count).forEach((category) => {
    const count = category_count[category]
    categories.push({
      name: category,
      count,
      percent: Math.floor((count / res.length) * 100),
    })
  })

  // 年ごとの読書数
  const years: Year[] = getYears().map((year, i) => {
    const count = res.filter((r) => r.year == year).length
    return { year, count }
  })

  return {
    props: {
      res,
      categories,
      years,
    },
  }
}
