import useSWR from 'swr'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Container } from '@/components/layout/Container'
import { Book } from '@/types/book'
import { BarGraph } from './BarGraph'
import { Books } from './Books'
import { BookRows } from './BookRows'
import { BookDetailSidebar } from './BookDetailSidebar'
import { BookDetailModal } from './BookDetailModal'
import { fetcher } from '@/libs/swr'
import { useSession } from 'next-auth/react'
import { YearlyTopBook } from '@/types/book'
import { YearlyTopBooks } from './YearlyTopBooks'
import { TitleWithLine } from '@/components/label/TitleWithLine'
import { CoutUpText } from '@/components/label/CountUpText'
import { NO_IMAGE } from '@/libs/constants'
import { SheetTabsWithMenu } from './SheetTabsWithMenu'
import { NextSeo } from 'next-seo'
import { useRouter } from 'next/router'
import { FaListUl } from 'react-icons/fa'
import { AiSummaries, AiSummariesJson } from './AiSummaries'
import { IoMdCloseCircle } from 'react-icons/io'
import { IoGrid } from 'react-icons/io5'
import { twMerge } from 'tailwind-merge'
import { BooksResponse } from '@/types/api'

const TreemapGraph = dynamic(
  () => import('./TreemapGraph').then((mod) => mod.TreemapGraph),
  { ssr: false }
)

interface Props {
  data: Book[]
  year: string
  sheets: Array<{ id: string; name: string; order: number }>
  username: string
  userId: string
  yearlyTopBooks: YearlyTopBook[]
  aiSummaries: AiSummariesJson[]
}

export const SheetPage: React.FC<Props> = ({
  data,
  year,
  sheets,
  username,
  userId,
  yearlyTopBooks,
  aiSummaries,
}) => {
  const router = useRouter()
  const { data: session } = useSession()
  // アクセスしているページが自分のページの場合、非公開メモも表示したいためクライアント側で改めて本データを取得する
  const { data: res } = useSWR<BooksResponse>(`/api/books/${year}`, fetcher, {
    fallbackData: { result: true, books: data },
  })
  const [currentData, setCurrentData] = useState<Book[]>(data)
  // 一覧表示か書影表示か
  const [mode, setMode] = useState<'row' | 'grid'>('grid')
  const [filter, setFilter] = useState('')

  // サイドバー用の状態管理
  const [openSidebar, setOpenSidebar] = useState(false)
  const [sidebarBook, setSidebarBook] = useState<Book | null>(null)

  // フルページモーダル用の状態管理
  const [openFullPageModal, setOpenFullPageModal] = useState(false)
  const [fullPageBook, setFullPageBook] = useState<Book>(null)

  const isMine = session && session.user.id === userId
  useEffect(() => {
    if (isMine) {
      setCurrentData(res?.books || [])
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
        <SheetTabsWithMenu
          sheets={sheets}
          currentSheet={year}
          username={username}
          userId={userId}
          variant="simple"
        />
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
      <SheetTabsWithMenu
        sheets={sheets}
        currentSheet={year}
        username={username}
        userId={userId}
      />

      <div className="mt-32 text-center">
        <TitleWithLine text="累計読書数" />
        <CoutUpText value={data.length} unit="冊" step={1} />
      </div>

      <div className="mb-10">
        <AiSummaries
          aiSummaries={aiSummaries}
          username={username}
          bookCount={data.length}
          sheet={year}
          isMine={isMine}
          books={data}
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
        {['grid', 'row'].map((v: 'grid' | 'row') => (
          <button
            key={v}
            className={twMerge(
              'flex items-center justify-center border border-gray-400 bg-gray-50 px-2 py-1 text-xs font-bold',
              mode === v && 'brightness-95',
              v === 'grid' ? 'rounded-l-md' : 'rounded-r-md'
            )}
            onClick={() => handleChange(v)}
          >
            {v === 'grid' ? (
              <>
                <IoGrid className="mr-1" />
                Grid
              </>
            ) : (
              <>
                <FaListUl className="mr-1" />
                List
              </>
            )}
          </button>
        ))}
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

      <BookDetailSidebar
        open={openSidebar}
        book={sidebarBook}
        onClose={() => {
          setOpenSidebar(false)
          setSidebarBook(null)
        }}
        onExpandToFullPage={() => {
          if (sidebarBook) {
            setFullPageBook(sidebarBook)
            setOpenFullPageModal(true)
            setOpenSidebar(false)
          }
        }}
      />

      <BookDetailModal
        open={openFullPageModal}
        book={fullPageBook}
        onClose={() => {
          setOpenFullPageModal(false)
          setFullPageBook(null)
        }}
      />
    </Container>
  )
}
