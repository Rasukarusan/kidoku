import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { MdDelete, MdReplay } from 'react-icons/md'
import dayjs from 'dayjs'
import {
  ReReading,
  bookReReadingsQuery,
  createReReadingMutation,
  deleteReReadingMutation,
} from '../api'

interface Props {
  bookId: number
  /** 初読の読了日（履歴の先頭に表示する） */
  firstFinished?: string | null
}

// 本詳細モーダル内の再読記録セクション（本人のみ表示）
export const ReReadingSection: React.FC<Props> = ({
  bookId,
  firstFinished,
}) => {
  const { data, refetch } = useQuery<{ bookReReadings: ReReading[] }>(
    bookReReadingsQuery,
    { variables: { input: { bookId } } }
  )
  const [createReReading, { loading: creating }] = useMutation(
    createReReadingMutation
  )
  const [deleteReReading] = useMutation(deleteReReadingMutation)
  const [open, setOpen] = useState(false)
  const [finished, setFinished] = useState(dayjs().format('YYYY-MM-DD'))
  const [memo, setMemo] = useState('')
  const [error, setError] = useState('')

  const reReadings = data?.bookReReadings ?? []

  const onAdd = async () => {
    setError('')
    if (!finished) {
      setError('読了日を入力してください')
      return
    }
    try {
      await createReReading({
        variables: {
          input: {
            bookId,
            finished: new Date(finished).toISOString(),
            memo: memo.trim() ? memo : null,
          },
        },
      })
      setMemo('')
      setOpen(false)
      await refetch()
    } catch {
      setError('再読記録の保存に失敗しました')
    }
  }

  const onDelete = async (reReading: ReReading) => {
    if (!window.confirm('この再読記録を削除してもよろしいですか？')) return
    await deleteReReading({
      variables: { input: { id: Number(reReading.id) } },
    })
    await refetch()
  }

  return (
    <div className="px-4 pb-4">
      <div className="mb-2 flex items-center">
        <MdReplay className="mr-1 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-800">再読の記録</h2>
        <button
          className="ml-auto rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 transition hover:bg-gray-50"
          onClick={() => setOpen(!open)}
        >
          {open ? '閉じる' : '再読を記録'}
        </button>
      </div>

      {open && (
        <div className="mb-4 rounded-lg border border-gray-200 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={finished}
              className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none"
              onChange={(e) => setFinished(e.target.value)}
            />
            <input
              value={memo}
              placeholder="再読して感じたこと（任意）"
              className="min-w-40 flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              onChange={(e) => setMemo(e.target.value)}
            />
            <button
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              disabled={creating}
              onClick={onAdd}
            >
              追加
            </button>
          </div>
          {error && <div className="mt-1 text-xs text-red-600">{error}</div>}
        </div>
      )}

      {reReadings.length === 0 && !open ? (
        <p className="text-sm text-gray-400">
          再読したらここに記録できます。感想の変化も残せます。
        </p>
      ) : (
        <ol className="relative ml-2 space-y-3 border-l border-gray-200 pl-4">
          {firstFinished && (
            <li className="text-sm">
              <span className="font-bold text-gray-700">
                {dayjs(firstFinished).format('YYYY/MM/DD')}
              </span>
              <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs text-gray-500">
                初読
              </span>
            </li>
          )}
          {reReadings.map((reReading, i) => (
            <li key={reReading.id} className="text-sm">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-gray-700">
                    {dayjs(reReading.finished).format('YYYY/MM/DD')}
                  </span>
                  <span className="ml-2 rounded bg-teal-50 px-2 py-0.5 text-xs text-teal-700">
                    {i + 2}回目
                  </span>
                  {reReading.memo && (
                    <p className="mt-1 text-xs text-gray-600">
                      {reReading.memo}
                    </p>
                  )}
                </div>
                <button
                  className="shrink-0 rounded-full p-1 text-gray-300 transition hover:bg-gray-200 hover:text-gray-500"
                  onClick={() => onDelete(reReading)}
                  aria-label="再読記録を削除"
                >
                  <MdDelete size={16} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
