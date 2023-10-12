import { ToggleButton } from '@/components/button/ToggleButton'
import { Loading } from '@/components/icon/Loading'
import { fetcher } from '@/libs/swr'
import { Item } from '@/types/search'
import { getBookInfo } from '@/utils/search'
import { useEffect, useState } from 'react'
import { useReward } from 'react-rewards'
import useSWR from 'swr'
import dayjs from 'dayjs'
import { Modal } from '@/components/layout/Modal'
import { ImagePicker } from '@/components/button/ImagePicker'
import { DangerAlert } from '@/components/label/DangerAlert'
import { SuccessAlert } from '@/components/label/SuccessAlert'
import { BookInputField } from '../BookInputField'

interface Response {
  result: boolean
  message: string
}

interface Props {
  open: boolean
  item: Item
  books: Item[]
  onClose: () => void
}

export const AddModal: React.FC<Props> = ({ open, item, books, onClose }) => {
  const { data } = useSWR(`/api/sheets`, fetcher, {
    fallbackData: { result: true, sheets: [] },
  })
  const [loading, setLoading] = useState(false)
  const [book, setBook] = useState(null)
  const [response, setResponse] = useState<Response>(null)
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
    const bookInfo = getBookInfo(item)
    setBook({
      ...bookInfo,
      is_public_memo: false,
      memo: '',
      impression: '',
      finished,
    })
  }, [item])

  const onClickAdd = async () => {
    if (!book) return
    setLoading(true)
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
      .catch((e) => {
        return {
          result: false,
          message: '本の登録に失敗しました。画像は3MBまで登録できます。',
        }
      })
    setResponse(res)
    if (res.result) {
      reward()
    }
    setLoading(false)
  }

  return (
    <Modal open={open} onClose={onClose} className="sm:w-1/2 h-3/4">
      <div className="flex flex-col justify-between h-full">
        <div className="p-4">
          <div className="flex items-center">
            <ImagePicker
              img={book?.image}
              onImageLoad={(image) => {
                setBook({ ...book, image })
              }}
            />
            <div className="w-2/3 mr-2">
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
              <BookInputField
                value={book?.category}
                onChange={(e) => setBook({ ...book, category: e.target.value })}
                label="カテゴリ"
                tabIndex={3}
              />
              <BookInputField
                value={book?.impression}
                onChange={(e) =>
                  setBook({ ...book, impression: e.target.value })
                }
                label="感想"
                tabIndex={4}
              />
            </div>
          </div>
          <BookInputField
            rows={4}
            value={book?.memo}
            onChange={(e) => setBook({ ...book, memo: e.target.value })}
            label="メモ"
            tabIndex={5}
          />
          <ToggleButton
            label="メモを公開する"
            checked={!!book?.is_public_memo}
            onChange={() => {
              setBook({ ...book, is_public_memo: !book?.is_public_memo })
            }}
          />
          <div className="w-full text-gray-900 text-center ">
            <select
              className="border p-2 px-4 cursor-pointer"
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
        </div>
        <div className="border-t border-1 text-center w-full">
          {response && (
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-32 sm:bottom-28 z-20">
              {response.result ? (
                <SuccessAlert
                  open={!!response}
                  text={response.message}
                  onClose={() => {
                    setResponse(null)
                  }}
                />
              ) : (
                <DangerAlert
                  open={!!response}
                  text={response.message}
                  onClose={() => {
                    setResponse(null)
                  }}
                />
              )}
            </div>
          )}
          <button
            className="hover:bg-blue-700 bg-blue-600 px-4 py-1 disabled:bg-blue-700 font-bold text-white w-full h-12 flex items-center justify-center rounded-b-md"
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
    </Modal>
  )
}
