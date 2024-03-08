import { useState } from 'react'
import { useRouter } from 'next/router'
import { Tabs } from '../Tabs'
import { Category, Year } from '../../types'
import { TitleWithLine } from '@/components/label/TitleWithLine'
import { Rankings } from './Rankings'
import { CategoryMap } from './CategoryMap'
import { YearsGraph } from './YearsGraph'
import { useSession } from 'next-auth/react'
import { YearlyTopBook } from '@/types/book'
import { Container } from '@/components/layout/Container'
import { CoutUpText } from '@/components/label/CountUpText'
import { Menu } from '../Menu'
import { NextSeo } from 'next-seo'
import { AiSummaries, AiSummariesJson } from '../AiSummaries'

interface Props {
  total: number
  categories: Category[]
  years: Year[]
  sheets: string[]
  username: string
  yearlyTopBooks: YearlyTopBook[]
  aiSummaries: AiSummariesJson[]
}
export const SheetTotalPage: React.FC<Props> = ({
  total,
  categories,
  years,
  sheets,
  username,
  yearlyTopBooks,
  aiSummaries,
}) => {
  const [tab, setTab] = useState('total')
  const router = useRouter()
  const { data: session } = useSession()
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue)
    if (session) {
      router.push(`/${session.user.name}/sheets/${newValue}`)
    }
  }
  const average = years.length === 0 ? 0 : Math.ceil(total / years.length)
  const isMine = session && session.user.name === username

  return (
    <Container>
      <NextSeo title={`${username}/Total | kidoku`} />
      <div className="fixed left-0 top-[53px] z-10 flex w-full items-center bg-white sm:top-[54px] sm:px-32">
        <div className="w-[90%] pr-4">
          <Tabs sheets={sheets} value="total" username={username} />
        </div>
        <div className="w-[10%]">
          <Menu
            currentSheet="total"
            username={username}
            activate={{ edit: false, delete: false }}
          />
        </div>
      </div>
      <div className="mb-10 mt-32 text-center">
        <TitleWithLine text="累計読書数" />
        <CoutUpText value={total} unit="冊" />
        <div className="mb-10">
          <AiSummaries
            aiSummaries={aiSummaries}
            username={username}
            bookCount={total}
            sheet="total"
            isTotal={true}
            isMine={isMine}
          />
        </div>

        <div className="m-auto mb-4 h-[200px] w-full sm:h-[300px] sm:w-3/4">
          <CategoryMap categories={categories} />
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
