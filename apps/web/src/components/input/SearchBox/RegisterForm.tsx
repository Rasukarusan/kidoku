import { ToggleButton } from '@/components/button/ToggleButton'
import { Loading } from '@/components/icon/Loading'
import { useEffect, useState } from 'react'
import { useApolloClient, useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import dynamic from 'next/dynamic'
import { ImagePicker } from '@/components/button/ImagePicker'
import { BookInputField } from '../BookInputField'
import { BookSelectBox } from '../BookSelectBox'
import { BookDatePicker } from '../BookDatePicker'
import { BookCreatableSelectBox } from '../BookCreatableSelectBox'
import { SheetAddModal } from '@/features/sheet/components/SheetAddModal'
import { AiOutlineFileAdd } from 'react-icons/ai'
import { IoArrowBack } from 'react-icons/io5'
import { useSession } from 'next-auth/react'
import { Label } from '../Label'
import { MaskingHint } from '@/components/label/MaskingHint'
import { getSheetsQuery } from '@/features/sheet/api'
import { getBookCategoriesQuery } from '@/features/books/api'
import { SearchResult } from '@/types/search'

const MarkdownEditor = dynamic(
  () =>
    import('@/components/input/MarkdownEditor').then(
      (mod) => mod.MarkdownEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <span className="text-gray-400">エディタを読み込み中...</span>
      </div>
    ),
  }
)

interface Response {
  result: boolean
  bookTitle: string
  bookId: number
  sheetName: string
}

interface RegisterFormProps {
  item: SearchResult
  onBack: () => void
  onSuccess: (response: Response) => void
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  item,
  onBack,
  onSuccess,
}) => {
  const { data: session } = useSession()
  const apolloClient = useApolloClient()
  const { data: sheetsData, refetch: refetchSheets } = useQuery(
    getSheetsQuery,
    { skip: !session }
  )
  const sheets = sheetsData?.sheets || []
  const [loading, setLoading] = useState(false)
  const [book, setBook] = useState(null)
  const [error, setError] = useState('')
  const [sheet, setSheet] = useState<{ id: number; name: string }>({
    id: null,
    name: null,
  })
  const [openAdd, setOpenAdd] = useState(false)

  const { data: categoriesData } = useQuery<{ bookCategories: string[] }>(
    getBookCategoriesQuery,
    { skip: !session }
  )
  const options = categoriesData
    ? categoriesData.bookCategories.map((category) => ({
        value: category,
        label: category,
      }))
    : []

  useEffect(() => {
    if (sheets.length === 0) return
    setSheet({ id: sheets[0].id, name: sheets[0].name })
  }, [sheets])

  useEffect(() => {
    setError('')
    if (!item) return
    const finished = dayjs().format('YYYY-MM-DD')
    setBook({
      ...item,
      isPublicMemo: false,
      memo: item.memo || '',
      impression: '-',
      finished,
    })
  }, [item])

  const onClickAdd = async () => {
    if (!book) return
    setLoading(true)
    setError('')
    const res: Response = await fetch(`/api/books`, {
      method: 'POST',
      body: JSON.stringify({
        ...book,
        sheet,
      }),
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => res.json())
      .catch(() => {
        return {
          result: false,
          message: '本の登録に失敗しました。画像は3MBまで登録できます。',
        }
      })
    if (res.result) {
      apolloClient.refetchQueries({ include: ['GetBooks'] })
      onSuccess(res)
    } else {
      setError('本の登録に失敗しました。画像は3MBまで登録できます。')
    }
    setLoading(false)
  }

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー: 戻るボタン */}
      <div className="flex shrink-0 items-center border-b border-gray-100 px-4 py-3">
        <button
          onClick={onBack}
          className="mr-3 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <IoArrowBack size={20} />
        </button>
        <h2 className="text-sm font-bold text-gray-700">本を登録</h2>
      </div>

      {/* フォーム本体 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 本の情報カード */}
        <div className="mb-4 flex items-start rounded-lg bg-gray-50 p-3">
          <ImagePicker
            img={book?.image}
            onImageLoad={(image) => {
              setBook({ ...book, image })
            }}
          />
          <div className="min-w-0 flex-1">
            <BookInputField
              value={book?.title}
              onChange={(e) => setBook({ ...book, title: e.target.value })}
              label="タイトル"
              tabIndex={1}
            />
            <BookInputField
              value={book?.author}
              onChange={(e) => setBook({ ...book, author: e.target.value })}
              label="著者"
              tabIndex={2}
            />
          </div>
        </div>

        {/* カテゴリ・感想・読了日 */}
        <div className="mb-4 space-y-3">
          <BookCreatableSelectBox
            label="カテゴリ"
            defaultValue={{
              value: book?.category,
              label: book?.category,
            }}
            options={options}
            tabIndex={3}
            onChange={(newValue: { value: string; label: string }) => {
              setBook({
                ...book,
                category: newValue?.value ?? '-',
              })
            }}
          />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <BookSelectBox
                value={book?.impression}
                label="感想"
                tabIndex={4}
                onChange={(e) =>
                  setBook({ ...book, impression: e.target.value })
                }
              />
            </div>
            <div className="flex-1">
              <BookDatePicker
                value={dayjs(book?.finished).format('YYYY-MM-DD')}
                label="読了日"
                tabIndex={5}
                onChange={(e) => {
                  setBook({
                    ...book,
                    finished: e.target.value
                      ? dayjs(e.target.value).format('YYYY-MM-DD')
                      : null,
                  })
                }}
              />
            </div>
          </div>
        </div>

        {/* メモ */}
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <Label text="メモ" className="mb-0 mr-2" />
              <MaskingHint />
            </div>
            <div className="text-xs text-gray-400">
              {book?.memo?.length || 0} 文字
            </div>
          </div>
          <MarkdownEditor
            value={book?.memo || ''}
            onChange={(memo) => setBook({ ...book, memo })}
            minHeight="150px"
          />
          <ToggleButton
            label="メモを公開する"
            checked={!!book?.isPublicMemo}
            onChange={() => {
              setBook({
                ...book,
                isPublicMemo: !book?.isPublicMemo,
              })
            }}
            className="mt-1"
          />
        </div>

        {/* シート選択 */}
        <div className="text-center text-gray-900">
          <SheetAddModal
            open={openAdd}
            onClose={() => {
              setOpenAdd(false)
              refetchSheets()
            }}
          />
          {sheets.length === 0 ? (
            <button
              className="mx-auto flex items-center justify-center whitespace-nowrap rounded-md bg-green-500 px-4 py-2 text-sm font-bold text-white disabled:bg-gray-500"
              onClick={() => setOpenAdd(true)}
              disabled={!session}
            >
              <AiOutlineFileAdd className="mr-1 h-[24px] w-[24px] text-white" />
              {session ? 'シートを追加' : 'ログインしてください'}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Label text="シート" className="mb-0" />
              <select
                className="cursor-pointer rounded-md border px-3 py-1.5 text-sm"
                onChange={(e) => {
                  const selectedOption = e.target.selectedOptions[0]
                  const sheetId = selectedOption.getAttribute('data-id')
                  setSheet({
                    id: Number(sheetId),
                    name: e.target.value,
                  })
                }}
              >
                {sheets.map((sheet) => {
                  const { id, name } = sheet
                  return (
                    <option key={name} value={name} data-id={id}>
                      {name}
                    </option>
                  )
                })}
              </select>
            </div>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mt-3 rounded-md bg-red-50 px-4 py-2 text-center text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* 登録ボタン（固定フッター） */}
      <div className="shrink-0 border-t">
        <button
          className="flex h-12 w-full items-center justify-center rounded-b-md bg-blue-600 font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
          onClick={onClickAdd}
          tabIndex={6}
          disabled={loading || !session}
        >
          {loading && (
            <Loading className="mr-2 h-[18px] w-[18px] border-[3px] border-white" />
          )}
          {session ? '本を登録する' : 'ログインしてください'}
        </button>
      </div>
    </div>
  )
}
