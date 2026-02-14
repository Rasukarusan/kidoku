import { useMemo } from 'react'
import { Category, Year } from '../../types'
import { TitleWithLine } from '@/components/label/TitleWithLine'
import { Rankings } from './Rankings'
import { YearsGraph } from './YearsGraph'
import { BasePieChart, PieSlice } from '../BasePieChart'
import { YearlyTopBook } from '@/types/book'
import { Container } from '@/components/layout/Container'
import { CoutUpText } from '@/components/label/CountUpText'
import { SheetTabsWithMenu } from '../SheetTabsWithMenu'
import { NextSeo } from 'next-seo'

interface Props {
  total: number
  categories: Category[]
  years: Year[]
  sheets: Array<{ id: string; name: string; order: number }>
  username: string
  userId: string
  yearlyTopBooks: YearlyTopBook[]
}
export const SheetTotalPage: React.FC<Props> = ({
  total,
  categories,
  years,
  sheets,
  username,
  userId,
  yearlyTopBooks,
}) => {
  const average = years.length === 0 ? 0 : Math.ceil(total / years.length)
  const categoryData: PieSlice[] = useMemo(() => {
    return categories.map((c) => ({
      name: c.name,
      value: c.count,
      percent: c.percent,
    }))
  }, [categories])

  return (
    <Container>
      <NextSeo title={`${username}/Total | kidoku`} />
      <SheetTabsWithMenu
        sheets={sheets}
        currentSheet="total"
        username={username}
        userId={userId}
        menuActivate={{ edit: false, delete: false }}
      />
      <div className="mb-10 mt-32 text-center">
        <TitleWithLine text="累計読書数" />
        <CoutUpText value={total} unit="冊" />

        <div className="m-auto mb-4 h-[300px] w-full sm:h-[400px] sm:w-3/4">
          <BasePieChart data={categoryData} outerRadius={120} stroke="none" />
        </div>

        <TitleWithLine text="年間平均読書数" />
        <CoutUpText value={average} unit="冊" />
        <div className="m-auto mb-4 h-[300px] w-full sm:w-3/4">
          <YearsGraph years={years} />
        </div>

        <TitleWithLine text="年間ベスト書籍" />
        {yearlyTopBooks.length > 0 ? (
          <Rankings yearlyTopBooks={yearlyTopBooks} />
        ) : (
          <div className="mt-4 font-bold">設定されていません</div>
        )}
      </div>
    </Container>
  )
}
