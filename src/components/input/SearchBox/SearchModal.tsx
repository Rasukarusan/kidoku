import { Loading } from '@/components/icon/Loading'
import { Item } from '@/types/search'
import { searchBooks } from '@/utils/search'
import { truncate } from '@/utils/string'
import { useEffect, useRef, useState } from 'react'
import { useReward } from 'react-rewards'
import { SuccessAlert } from '@/components/label/SuccessAlert'
import { DanDangerAlert } from '@/components/label/DangerAlert'
import useSWR from 'swr'
import { fetcher } from '@/libs/swr'
// import { items } from './mock'

interface AddResult {
  result: boolean
  message: string
}
interface Props {
  open: boolean
  onClose: () => void
}
export const SearchModal: React.FC<Props> = ({ open, onClose }) => {
  const { data } = useSWR(`/api/sheets`, fetcher, {
    fallbackData: { result: true, sheets: [] },
  })
  const ref = useRef<HTMLInputElement>(null)
  const [sheet, setSheet] = useState<{ id: number; name: string }>({
    id: null,
    name: null,
  })
  const [results, setResults] = useState<Item[]>([])
  const [selectItem, setSelectItem] = useState<Item>(null)
  const [addResult, setAddResult] = useState<AddResult>(null)
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const { reward, isAnimating } = useReward('rewardId', 'confetti', {
    elementCount: 200,
  })
  // 検索モーダル開いたら自動でinputフィールドにフォーカスする
  useEffect(() => {
    ref.current?.focus()
  }, [open])

  // シート取得次第、一番上のシートを選択状態にする
  useEffect(() => {
    if (data.sheets.length === 0) return
    setSheet({ id: data.sheets[0].id, name: data.sheets[0].name })
  }, [data])

  // デバウンス。入力から一定時間経った後に検索を実行する。
  // 300ms以内に入力があった場合はタイマーがクリアされ、新しいタイマーが設定され、デバウンスが実現される。
  useEffect(() => {
    if (!inputValue) return
    const timer = setTimeout(async () => {
      const items = await searchBooks(inputValue)
      setResults(items)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const onClickAdd = async () => {
    setLoading(true)
    const book = results.filter((item) => item.id === selectItem.id).pop()
    if (!book) return
    const { title, description, authors, imageLinks, categories } =
      book.volumeInfo
    const author = authors ? authors.join(',') : '-'
    const category = categories ? categories.join(',') : '-'
    const image = imageLinks ? imageLinks.thumbnail : '/no-image.png'
    const res: AddResult = await fetch(`/api/books`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        author,
        image,
        category,
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

  if (!open) return null

  return (
    <>
      <div
        className="fixed w-full h-full backdrop-blur-[4px] flex justify-center items-center z-[1000] left-0 top-0 bg-[rgba(0,0,0,0.1)] overflow-y-hidden p-8"
        onClick={onClose}
      >
        <div
          className="w-full sm:w-2/3 bg-white h-2/3 sm:h-3/4 rounded-md overflow-y-hidden flex-col relative flex m-2 sm:m-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center border-b-[#f1f5f9] border-b pt-2 px-2 shrink-0">
            <div className="relative text-gray-600 w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <button
                  type="submit"
                  className="p-1 focus:outline-none focus:shadow-outline"
                >
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    className="w-6 h-6"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </span>
              <input
                ref={ref}
                type="search"
                name="q"
                className="py-2 text-sm bg-white rounded-md pl-12 pr-2 h-12 focus:outline-none text-gray-900 w-full appearance-none"
                placeholder="本を追加"
                autoComplete="off"
                onChange={onChange}
              />
            </div>
          </div>
          <div className="w-full text-gray-900 p-4 flex flex-wrap justify-center overflow-y-auto h-full">
            {results.map((item: Item, i: number) => {
              const { title, description, authors, imageLinks } =
                item.volumeInfo
              return (
                <div
                  className={`w-2/3 sm:w-[200px] max-h-[300px] h-[300px] border border-gray-300 m-2 px-4 py-2 rounded-md shadow cursor-pointer hover:bg-gray-100 ${
                    selectItem?.id === item.id
                      ? 'bg-pink-200 hover:bg-pink-200'
                      : 'bg-white'
                  }`}
                  key={item.id}
                  onClick={() =>
                    setSelectItem(selectItem?.id === item.id ? null : item)
                  }
                >
                  <div className="font-bold mb-1">{truncate(title, 15)}</div>
                  <div className="text-xs mb-1">
                    {Array.isArray(authors)
                      ? truncate(authors.join(','), 12)
                      : '-'}
                  </div>
                  <img
                    className="m-auto mb-1 h-[150px] object-contain"
                    src={imageLinks ? imageLinks.thumbnail : '/no-image.png'}
                    alt={title}
                    loading="lazy"
                  />
                  <div className="text-sm">{truncate(description, 30)}</div>
                </div>
              )
            })}
          </div>

          {isAnimating && addResult && (
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-10">
              {addResult.result ? (
                <SuccessAlert
                  open={true}
                  text={addResult.message}
                  onClose={() => setAddResult(null)}
                />
              ) : (
                <DanDangerAlert
                  open={true}
                  text={addResult.message}
                  onClose={() => setAddResult(null)}
                />
              )}
            </div>
          )}
          <div className="w-full text-gray-900 text-center h-16 p-2">
            <select
              className="border p-2 px-4"
              onChange={(e) => {
                const selectedOption = e.target.selectedOptions[0]
                const sheetId = selectedOption.getAttribute('data-id')
                setSheet({
                  id: Number(sheetId),
                  name: e.target.value,
                })
              }}
            >
              {data.sheets.map((sheet) => {
                const { id, name } = sheet
                return (
                  <option key={name} value={name} data-id={id}>
                    {name}
                  </option>
                )
              })}
            </select>
          </div>
          <div
            className={`w-full text-center h-[50px] flex items-center justify-center shrink-0 ${
              selectItem ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'
            }`}
          >
            <button
              className="font-bold text-white flex items-center disabled:font-medium w-full h-full justify-center"
              onClick={onClickAdd}
              disabled={!selectItem || isAnimating}
            >
              {loading && (
                <Loading className="w-[18px] h-[18px] border-[3px] mr-2 border-white" />
              )}
              <span id="rewardId">追加する</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
