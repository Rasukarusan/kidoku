import useSWR from 'swr'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Container } from '@/components/layout/Container'
import { Book } from '@/types/book'
import { BarGraph } from './BarGraph'
import { Tabs } from './Tabs'
import { Books } from './Books'
import { BookRows } from './BookRows'
import { fetcher } from '@/libs/swr'
import { useSession } from 'next-auth/react'
import { YearlyTopBook } from '@/types/book'
import { YearlyTopBooks } from './YearlyTopBooks'
import { TitleWithLine } from '@/components/label/TitleWithLine'
import { CoutUpText } from '@/components/label/CountUpText'
import { NO_IMAGE } from '@/libs/constants'
import { Menu } from './Menu'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { BsFillGrid3X3GapFill } from 'react-icons/bs'
import { FaListUl } from 'react-icons/fa'
import { AiSummary, AiSummaryJson } from './AiSummary'
import { IoMdCloseCircle } from 'react-icons/io'

const TreemapGraph = dynamic(
  () => import('./TreemapGraph').then((mod) => mod.TreemapGraph),
  { ssr: false }
)

interface Props {
  data: Book[]
  year: string
  sheets: string[]
  username: string
  yearlyTopBooks: YearlyTopBook[]
  aiSummary: AiSummaryJson
}

export const SheetPage: React.FC<Props> = ({
  data,
  year,
  sheets,
  username,
  yearlyTopBooks,
  aiSummary,
}) => {
  const router = useRouter()
  const { data: session } = useSession()
  // アクセスしているページが自分のページの場合、非公開メモも表示したいためクライアント側で改めて本データを取得する
  const { data: res } = useSWR(`/api/books/${year}`, fetcher, {
    fallbackData: { result: true, books: data },
  })
  const [currentData, setCurrentData] = useState<Book[]>(data)
  // 一覧表示か書影表示か
  const [mode, setMode] = useState<'row' | 'grid'>('grid')
  const [filter, setFilter] = useState('')

  const isMine =
    data.length > 0 && session && session.user.id === data[0].userId
  useEffect(() => {
    if (isMine) {
      setCurrentData(res.books)
    } else {
      setCurrentData(data)
    }
  }, [res, session, data])

  const setShowData = (newData: Book[]) => {
    setCurrentData(newData)
  }

  const handleChange = (newMode: 'row' | 'grid') => {
    setMode(newMode)
  }

  if (data.length === 0) {
    return (
      <Container>
        <NextSeo title={`${username}/${year} | kidoku`} />
        <div className="flex items-center">
          <div className="mb-8 w-[90%] border-b border-gray-200">
            <Tabs sheets={sheets} value={year} username={username} />
          </div>
          <div className="w-[10%]">
            <Menu currentSheet={year} username={username} />
          </div>
        </div>
        <div className="p-10 text-center">
          <div className="mb-4 text-2xl font-bold">
            <span className="text-4xl">🐘 </span>あなたの本がここに表示されます
          </div>
          <img src={NO_IMAGE} alt="" width="350" className="m-auto" />
        </div>
      </Container>
    )
  }

  return (
    <Container className="mb-12">
      <NextSeo title={`${username}/${year} | kidoku`} />
      <div className="fixed left-0 top-[53px] z-10 flex w-full items-center bg-white sm:top-[54px] sm:px-32">
        <div className="w-[90%] pr-4">
          <Tabs sheets={sheets} value={year} username={username} />
        </div>
        <div className="w-[10%]">
          <Menu currentSheet={year} username={username} />
        </div>
      </div>

      <div className="mb-10 mt-32 text-center">
        <TitleWithLine text="累計読書数" />
        <CoutUpText value={data.length} unit="冊" step={1} />
      </div>

      <div className="mb-10">
        <AiSummary
          aiSummary={aiSummary}
          username={username}
          bookCount={data.length}
          sheet={year}
        />
      </div>

      <YearlyTopBooks
        books={currentData}
        year={year}
        yearlyTopBooks={yearlyTopBooks}
      />

      <div className="mb-14 flex w-full flex-wrap justify-center">
        <div className="w-full text-center sm:w-1/2">
          <TitleWithLine text="月ごとの読書数" className="mb-4" />
          <BarGraph
            records={data}
            setShowData={setShowData}
            setFilter={(newFilter) => setFilter(newFilter)}
          />
        </div>
        <div className="w-full text-center sm:w-1/2">
          <TitleWithLine text="カテゴリ内訳" className="mb-4" />
          <TreemapGraph
            sheet={year}
            records={data}
            setShowData={setShowData}
            setFilter={(newFilter) => setFilter(newFilter)}
          />
        </div>
      </div>

      <div className="mb-8 flex items-center justify-center sm:mb-8">
        <div className="mr-2 h-6 text-2xl font-bold">
          {filter && `「${filter}」の本`}
        </div>
        {filter && (
          <button
            onClick={() => {
              setFilter('')
              if (isMine) {
                setCurrentData(res.books)
              } else {
                setCurrentData(data)
              }
            }}
          >
            <IoMdCloseCircle size={20} />
          </button>
        )}
      </div>

      <div className="mb-8 flex justify-end">
        <button
          className={`flex items-center justify-center rounded-l-md border border-gray-400 bg-gray-50 px-2 py-1 text-xs ${
            mode === 'grid' ? 'bg-gray-300' : ''
          }`}
          onClick={() => handleChange('grid')}
        >
          <BsFillGrid3X3GapFill className="mr-1" />
          Grid
        </button>
        <button
          className={`flex items-center justify-center rounded-r-md border border-gray-400 bg-gray-50 px-2  py-1 text-xs ${
            mode === 'row' ? 'bg-gray-300' : ''
          }`}
          onClick={() => handleChange('row')}
        >
          <FaListUl className="mr-1" />
          List
        </button>
      </div>

      <div className="mb-8">
        {mode === 'grid' ? (
          <Books
            books={currentData}
            year={year}
            bookId={(router.query.book as string) || ''}
          />
        ) : (
          <BookRows books={currentData} />
        )}
      </div>
    </Container>
  )
}
