import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
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
import { useQuery } from '@apollo/client'
import { getBooksQuery } from '@/features/books/api'
import dayjs from 'dayjs'
import { FiShare2 } from 'react-icons/fi'
import { shareToSns } from '@/utils/socialShare'

const CategoryPieChart = dynamic(
  () => import('./CategoryPieChart').then((mod) => mod.CategoryPieChart),
  { ssr: false }
)

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
  const { data: booksData } = useQuery(getBooksQuery, {
    variables: { input: { sheetName: year } },
  })
  const res = useMemo(
    () =>
      booksData?.books
        ? {
            books: booksData.books.map(
              (book: {
                id: string
                userId: string
                sheetId: number
                title: string
                author: string
                category: string
                image: string
                impression: string
                memo: string
                isPublicMemo: boolean
                isPurchasable: boolean
                finished: string | null
              }) => ({
                id: Number(book.id),
                userId: book.userId,
                month: book.finished
                  ? ((dayjs(book.finished).format('M') + '月') as Book['month'])
                  : ('1月' as Book['month']),
                title: book.title,
                author: book.author,
                category: book.category,
                image: book.image,
                impression: book.impression,
                memo: book.memo ?? '',
                finished: book.finished,
                isPublicMemo: book.isPublicMemo,
                isPurchasable: book.isPurchasable,
                sheetId: book.sheetId,
                sheet: year,
              })
            ),
          }
        : { books: data },
    [booksData, data, year]
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

  const isMine = session && session.user.id === userId
  const host = process.env.NEXT_PUBLIC_HOST || 'https://kidoku.net'
  const monthlySummary = useMemo(() => {
    const counts = data.reduce(
      (acc, book) => {
        acc[book.month] = (acc[book.month] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    if (entries.length === 0) return '今月の記録はまだありません。'
    const [month, count] = entries[0]
    return `${year}は合計${data.length}冊。最も読んだのは${month}で${count}冊でした。`
  }, [data, year])
  // 最もよく読んだジャンル
  const topCategory = useMemo(() => {
    const counts = data.reduce(
      (acc, book) => {
        if (book.category) acc[book.category] = (acc[book.category] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return entries[0]?.[0] ?? ''
  }, [data])

  // ベストブック（年間ベスト指定があれば優先、なければ最高評価の本）
  const bestBook = useMemo(() => {
    if (yearlyTopBooks?.[0]?.book) {
      return {
        title: yearlyTopBooks[0].book.title,
        image: yearlyTopBooks[0].book.image,
      }
    }
    const ranked = [...data].sort(
      (a, b) =>
        getImpressionValue(b.impression) - getImpressionValue(a.impression)
    )
    return ranked[0] ? { title: ranked[0].title, image: ranked[0].image } : null
  }, [data, yearlyTopBooks])

  // AI診断結果（あれば最優先のシェア素材）
  const latestAiSummary = useMemo(
    () => aiSummaries?.find((s) => s?.character_summary) ?? null,
    [aiSummaries]
  )

  const wrappedOgImage = `${host}/api/og?type=wrapped&user=${encodeURIComponent(
    username
  )}&year=${encodeURIComponent(year)}&count=${data.length}&category=${encodeURIComponent(
    topCategory
  )}&book=${encodeURIComponent(bestBook?.title ?? '')}${
    bestBook?.image && /^https?:\/\//.test(bestBook.image)
      ? `&image=${encodeURIComponent(bestBook.image)}`
      : ''
  }`
  const aiOgImage = latestAiSummary
    ? `${host}/api/og?type=ai&user=${encodeURIComponent(
        username
      )}&summary=${encodeURIComponent(
        latestAiSummary.character_summary
      )}&sub=${encodeURIComponent(latestAiSummary.overall_feedback ?? '')}`
    : ''
  // AI診断があればそれを、なければ年間まとめ（Wrapped）をOGに使う
  const ogImage = latestAiSummary ? aiOgImage : wrappedOgImage

  const shareUrl = `${host}/${encodeURIComponent(username)}/sheets/${encodeURIComponent(year)}`
  const wrappedShareText = `${year}の読書まとめ📚\n${data.length}冊読みました${
    topCategory ? `（よく読んだジャンル: ${topCategory}）` : ''
  }\nあなたも読書まとめ作ってみて👇\n#kidoku #読書まとめ`

  // シート切り替え時にステートをリセット
  useEffect(() => {
    setFilter('')
    setSortBy('default')
    setOpenSidebar(false)
    setSidebarBook(null)
    setOpenFullPageModal(false)
    setFullPageBook(null)
  }, [year])

  useEffect(() => {
    if (isMine) {
      setCurrentData(res?.books || [])
    } else {
      setCurrentData(data)
    }
  }, [res, isMine, data])

  const setShowData = (newData: Book[]) => {
    setCurrentData(newData)
  }

  const handleChange = (newMode: 'row' | 'grid') => {
    setMode(newMode)
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
        <NextSeo
          title={`${username}/${year} | kidoku`}
          openGraph={{ images: [{ url: ogImage, width: 1200, height: 630 }] }}
          twitter={{ cardType: 'summary_large_image' }}
        />
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
      <NextSeo
        title={`${username}/${year} | kidoku`}
        description={monthlySummary}
        openGraph={{
          title: `${username}の${year}読書まとめ`,
          description: monthlySummary,
          images: [{ url: ogImage, width: 1200, height: 630 }],
        }}
        twitter={{ cardType: 'summary_large_image' }}
      />
      <SheetTabsWithMenu
        sheets={sheets}
        currentSheet={year}
        username={username}
        userId={userId}
      />

      <div className="mt-32 text-center">
        <TitleWithLine text="累計読書数" />
        <CoutUpText value={data.length} unit="冊" step={1} />
        {isMine && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => shareToSns(wrappedShareText, shareUrl)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-2 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 hover:brightness-105"
            >
              <FiShare2 size={16} />
              {year}の読書まとめをシェア
            </button>
          </div>
        )}
      </div>

      <div className="mb-10 mt-12">
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
