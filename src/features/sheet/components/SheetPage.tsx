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
}

export const SheetPage: React.FC<Props> = ({
  data,
  year,
  sheets,
  username,
  yearlyTopBooks,
}) => {
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
        <div className="border-b border-gray-200 mb-8">
          <Tabs sheets={sheets} value={year} username={username} />
        </div>
        <div className="p-10 text-center">
          <div className="text-4xl font-bold mb-4">データがまだありません</div>
          <img src={NO_IMAGE} alt="" width="400" className="m-auto" />
        </div>
      </Container>
    )
  }

  return (
    <Container className="mb-12">
      <div className="border-b border-gray-200 mb-8">
        <Tabs sheets={sheets} value={year} username={username} />
      </div>
      <div className="text-center mb-10">
        <TitleWithLine text="累計読書数" />
        <CoutUpText value={data.length} unit="冊" step={1} />
      </div>
      <YearlyTopBooks
        books={currentData}
        year={year}
        yearlyTopBooks={yearlyTopBooks}
      />

      <div className="w-full mb-14 flex justify-center flex-wrap">
        <div className="w-full sm:w-1/2 text-center">
          <TitleWithLine text="月ごとの読書数" className="mb-4" />
          <BarGraph
            records={data}
            setShowData={setShowData}
            setFilter={(newFilter) => setFilter(newFilter)}
          />
        </div>
        <div className="w-full sm:w-1/2 text-center">
          <TitleWithLine text="カテゴリ内訳" className="mb-4" />
          <TreemapGraph
            records={data}
            setShowData={setShowData}
            setFilter={(newFilter) => setFilter(newFilter)}
          />
        </div>
      </div>

      <div className="flex justify-end mb-8">
        <button
          className={`bg-gray-50 border border-gray-400 px-2 text-xs flex justify-center items-center py-1 rounded-l-md ${
            mode === 'grid' ? 'bg-gray-300' : ''
          }`}
          onClick={() => handleChange('grid')}
        >
          <img
            src="/grid_icon.png"
            alt=""
            width="15"
            height="15"
            className=" mr-1"
            loading="lazy"
          />
          Grid
        </button>
        <button
          className={`bg-gray-50 border border-gray-400 px-2 text-xs flex justify-center items-center  py-1 rounded-r-md ${
            mode === 'row' ? 'bg-gray-300' : ''
          }`}
          onClick={() => handleChange('row')}
        >
          <img
            src="/list_icon.png"
            alt=""
            width="15"
            height="15"
            className=" mr-1"
            loading="lazy"
          />
          List
        </button>
      </div>

      {filter && (
        <div className="flex justify-center items-center mb-8 sm:mb-12">
          <div className="text-2xl font-bold mr-2">「{filter}」の本</div>
          <button
            className="rounded-full w-6 h-6 bg-gray-200 text-xs text-center font-bold"
            onClick={() => {
              setFilter('')
              if (isMine) {
                setCurrentData(res.books)
              } else {
                setCurrentData(data)
              }
            }}
          >
            ✗
          </button>
        </div>
      )}

      <div className="mb-8">
        {mode === 'grid' ? (
          <Books books={currentData} year={year} />
        ) : (
          <BookRows books={currentData} />
        )}
      </div>
    </Container>
  )
}
