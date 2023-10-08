import { Loading } from '@/components/icon/Loading'
import { DanDangerAlert } from '@/components/label/DangerAlert'
import { SuccessAlert } from '@/components/label/SuccessAlert'
import { fetcher } from '@/libs/swr'
import { Item } from '@/types/search'
import { useEffect, useState } from 'react'
import { useReward } from 'react-rewards'
import useSWR from 'swr'

interface AddResult {
  result: boolean
  message: string
}

interface Props {
  item: Item
  books: Item[]
  onClose: () => void
}

export const AddModal: React.FC<Props> = ({ item, books, onClose }) => {
  console.log('addmodal->', item)
  const { data } = useSWR(`/api/sheets`, fetcher, {
    fallbackData: { result: true, sheets: [] },
  })
  const [loading, setLoading] = useState(false)
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

  const onClickAdd = async () => {
    setLoading(true)
    const book = books.filter((item) => item.id === item.id).pop()
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
  return (
    <div
      className="fixed w-full h-full backdrop-blur-[4px] flex justify-center items-center z-[1000] left-0 top-0 bg-[rgba(0,0,0,0.1)] overflow-y-hidden p-8"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-2/3 bg-red-100  h-2/3 sm:h-3/4 rounded-md overflow-y-hidden flex-col relative flex m-2 sm:m-0 text-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div>hごえほげほhげお</div>
        <div>{item?.volumeInfo.title}</div>
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
            item ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'
          }`}
        >
          <button
            className="font-bold text-white flex items-center disabled:font-medium w-full h-full justify-center"
            onClick={onClickAdd}
            disabled={!item || isAnimating}
          >
            {loading && (
              <Loading className="w-[18px] h-[18px] border-[3px] mr-2 border-white" />
            )}
            <span id="rewardId">追加する</span>
          </button>
        </div>
      </div>
    </div>
  )
}
