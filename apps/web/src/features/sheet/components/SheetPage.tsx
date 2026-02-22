import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import dayjs from 'dayjs'
import { useQuery } from '@apollo/client'
import { Container } from '@/components/layout/Container'
import { Book } from '@/types/book'
import { BarGraph } from './BarGraph'
import { Books } from './Books'
import { BookRows } from './BookRows'
import { BookDetailSidebar } from './BookDetailSidebar'
import { BookDetailModal } from './BookDetailModal'
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
import { getBooksQuery } from '@/features/books/api'

const CategoryPieChart = dynamic(
  () => import('./CategoryPieChart').then((mod) => mod.CategoryPieChart),
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
  const isMine = session && session.user.id === userId
  // アクセスしているページが自分のページの場合、非公開メモも表示したいためクライアント側で改めて本データを取得する
  const { data: booksQueryData, refetch: refetchBooks } = useQuery(
    getBooksQuery,
    {
      variables: { input: { sheetName: year } },
      skip: !isMine,
    }
  )
  const [currentData, setCurrentData] = useState<Book[]>(data)
  // 一覧表示か書影表示か
  const [mode, setMode] = useState<'row' | 'grid'>('grid')
  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState<
    'default' | 'impression_desc' | 'impression_asc' | 'memo_desc' | 'memo_asc'
  >('default')

  // サイドバー用の状態管理
  const [openSidebar, setOpenSidebar] = useState(false)
  const [sidebarBook, setSidebarBook] = useState<Book | null>(null)

  // フルページモーダル用の状態管理
  const [openFullPageModal, setOpenFullPageModal] = useState(false)
  const [fullPageBook, setFullPageBook] = useState<Book>(null)

  useEffect(() => {
    if (isMine && booksQueryData?.books) {
      const books: Book[] = booksQueryData.books.map((book) => ({
        ...book,
        id: Number(book.id),
        month:
          (book.finished
            ? dayjs(book.finished).format('M')
            : dayjs().format('M')) + '月',
        memo: book.memo || '',
      }))
      setCurrentData(books)
    } else if (!isMine) {
      setCurrentData(data)
    }
  }, [booksQueryData, session, data, isMine])

  const setShowData = (newData: Book[]) => {
    setCurrentData(newData)
  }

  const handleChange = (newMode: 'row' | 'grid') => {
    setMode(newMode)
  }

  // impressionの値を数値にマッピング
  const getImpressionValue = (impression: string): number => {
    const map: { [key: string]: number } = {
      '◎': 4,
      '◯': 3,
      '△': 2,
      '✗': 1,
      '-': 0,
    }
    return map[impression] ?? 0
  }

  // ソート処理
  const sortBooks = (books: Book[]): Book[] => {
    if (sortBy === 'default') return books

    const sorted = [...books]
    switch (sortBy) {
      case 'impression_desc':
        return sorted.sort(
          (a, b) =>
            getImpressionValue(b.impression) - getImpressionValue(a.impression)
        )
      case 'impression_asc':
        return sorted.sort(
          (a, b) =>
            getImpressionValue(a.impression) - getImpressionValue(b.impression)
        )
      case 'memo_desc':
        return sorted.sort((a, b) => b.memo.length - a.memo.length)
      case 'memo_asc':
        return sorted.sort((a, b) => a.memo.length - b.memo.length)
      default:
        return sorted
    }
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
          <CategoryPieChart
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
              if (isMine && booksQueryData?.books) {
                const books: Book[] = booksQueryData.books.map((book) => ({
                  ...book,
                  id: Number(book.id),
                  month:
                    (book.finished
                      ? dayjs(book.finished).format('M')
                      : dayjs().format('M')) + '月',
                  memo: book.memo || '',
                }))
                setCurrentData(books)
              } else {
                setCurrentData(data)
              }
            }}
          >
            <IoMdCloseCircle size={20} />
          </button>
        )}
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) =>
              setSortBy(
                e.target.value as
                  | 'default'
                  | 'impression_desc'
                  | 'impression_asc'
                  | 'memo_desc'
                  | 'memo_asc'
              )
            }
            className="rounded-md border border-gray-400 bg-gray-50 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">登録順</option>
            <option value="impression_desc">感想順（高評価）</option>
            <option value="impression_asc">感想順（低評価）</option>
            <option value="memo_desc">感想が長い順</option>
            <option value="memo_asc">感想が短い順</option>
          </select>
        </div>

        <div className="flex">
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
      </div>

      <div className="mb-8">
        {mode === 'grid' ? (
          <Books
            books={sortBooks(currentData)}
            bookId={(router.query.book as string) || ''}
            onRefetch={() => refetchBooks()}
          />
        ) : (
          <BookRows books={sortBooks(currentData)} />
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
