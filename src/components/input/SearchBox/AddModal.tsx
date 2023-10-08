import { ToggleButton } from '@/components/button/ToggleButton'
import { Loading } from '@/components/icon/Loading'
import { fetcher } from '@/libs/swr'
import { Item } from '@/types/search'
import { getBookInfo } from '@/utils/search'
import { useEffect, useState } from 'react'
import { useReward } from 'react-rewards'
import useSWR from 'swr'
import dayjs from 'dayjs'

interface AddResult {
  result: boolean
  message: string
}

interface Props {
  item: Item
  books: Item[]
  onClose: () => void
}

export const Label: React.FC<{ text: string }> = ({ text }) => {
  return <div className="text-gray-400 text-xs mb-1">{text}</div>
}

export const AddModal: React.FC<Props> = ({ item, books, onClose }) => {
  const { data } = useSWR(`/api/sheets`, fetcher, {
    fallbackData: { result: true, sheets: [] },
  })
  const [loading, setLoading] = useState(false)
  const [book, setBook] = useState(null)
  const [addResult, setAddResult] = useState<AddResult>(null)
  const { reward, isAnimating } = useReward('rewardId', 'confetti', {
    elementCount: 200,
  })
  const [sheet, setSheet] = useState<{ id: number; name: string }>({
    id: null,
    name: null,
  })

  // シート取得次第、一番上のシートを選択状態にする
  useEffect(() => {
    if (data.sheets.length === 0) return
    setSheet({ id: data.sheets[0].id, name: data.sheets[0].name })
  }, [data])

  useEffect(() => {
    if (!item) return
    const finished = dayjs().format('YYYY-MM-DD')
    setBook({
      ...getBookInfo(item),
      is_public_memo: false,
      memo: '',
      impression: '',
      finished,
    })
  }, [item])

  const onClickAdd = async () => {
    if (!book) return
    setLoading(true)
    const res: AddResult = await fetch(`/api/books`, {
      method: 'POST',
      body: JSON.stringify({
        ...book,
        sheet,
      }),
      headers: {
        Accept: 'application/json',
      },
    }).then((res) => res.json())
    setAddResult(res)
    if (res.result) {
      reward()
    }
    setLoading(false)
  }
  return (
    <div
      className="fixed w-full h-full backdrop-blur-[4px] flex justify-center items-center z-[1000] left-0 top-0 bg-[rgba(0,0,0,0.1)] overflow-y-hidden p-8"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-2/3 bg-white  h-2/3 sm:h-3/4 rounded-md overflow-y-hidden flex-col relative flex m-2 sm:m-0 text-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 overflow-y-hidden">
          <div className="flex items-start">
            <div className="w-1/3 mr-4">
              <img
                className="mx-auto my-0 drop-shadow-lg"
                src={book?.image}
                alt={book?.title}
              />
            </div>
            <div className="w-2/3 mr-2">
              <Label text="タイトル" />
              <textarea
                className="mb-1 overflow-hidden w-full mr-2 bg-slate-100 px-2 py-1 text-sm sm:text-base"
                value={book?.title}
                onChange={(e) => {
                  setBook({ ...book, title: e.target.value })
                }}
                tabIndex={1}
              />
              <div className="mb-1">
                <Label text="著者" />
                <textarea
                  value={book?.author}
                  rows={1}
                  className="pl-2 py-1 bg-slate-100 w-full text-sm sm:text-base"
                  onChange={(e) => {
                    setBook({ ...book, author: e.target.value })
                  }}
                  tabIndex={2}
                />
              </div>
              <div className="mb-1">
                <Label text="カテゴリ" />
                <textarea
                  value={book?.category}
                  rows={1}
                  className="pl-2 py-1 bg-slate-100 w-full text-sm sm:text-base"
                  onChange={(e) => {
                    setBook({ ...book, category: e.target.value })
                  }}
                  tabIndex={3}
                />
              </div>
              <div className="mb-1">
                <Label text="感想" />
                <textarea
                  value={book?.impression}
                  rows={1}
                  className="pl-2 py-1 bg-slate-100 w-full text-sm sm:text-base"
                  onChange={(e) => {
                    setBook({ ...book, impression: e.target.value })
                  }}
                  tabIndex={4}
                />
              </div>
            </div>
          </div>
          <>
            <Label text="メモ" />
            <textarea
              value={book?.memo}
              className="w-full p-2 bg-slate-100 w-full mb-1 text-sm sm:text-base"
              rows={4}
              cols={80}
              onChange={(e) => {
                setBook({ ...book, memo: e.target.value })
              }}
              tabIndex={5}
            />
            <ToggleButton
              label="メモを公開する"
              checked={!!book?.is_public_memo}
              onChange={() => {
                setBook({ ...book, is_public_memo: !book?.is_public_memo })
              }}
            />
          </>
        </div>
        <div className="border-t border-1 text-center w-full">
          <button
            className="hover:bg-blue-700 bg-blue-600 px-4 py-1 disabled:bg-blue-700 font-bold text-white w-full h-12 flex items-center justify-center"
            onClick={onClickAdd}
            tabIndex={6}
            disabled={isAnimating}
          >
            {loading && (
              <Loading className="w-[18px] h-[18px] border-[3px] mr-2 border-white" />
            )}
            <span id="rewardId">本を登録する</span>
          </button>
        </div>
      </div>
    </div>
  )
}
