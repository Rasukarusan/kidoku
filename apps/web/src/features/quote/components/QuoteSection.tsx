import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { ImQuotesLeft } from 'react-icons/im'
import { MdDelete } from 'react-icons/md'
import {
  Quote,
  bookQuotesQuery,
  createQuoteMutation,
  deleteQuoteMutation,
} from '../api'

interface Props {
  bookId: number
}

// 本詳細モーダル内の引用・抜き書きセクション（本人のみ表示）
export const QuoteSection: React.FC<Props> = ({ bookId }) => {
  const { data, refetch } = useQuery<{ bookQuotes: Quote[] }>(bookQuotesQuery, {
    variables: { input: { bookId } },
  })
  const [createQuote, { loading: creating }] = useMutation(createQuoteMutation)
  const [deleteQuote] = useMutation(deleteQuoteMutation)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [page, setPage] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const quotes = data?.bookQuotes ?? []

  const onAdd = async () => {
    setError('')
    if (!text.trim()) {
      setError('引用文を入力してください')
      return
    }
    try {
      await createQuote({
        variables: {
          input: {
            bookId,
            text,
            page: page ? Number(page) : null,
            comment: comment.trim() ? comment : null,
          },
        },
      })
      setText('')
      setPage('')
      setComment('')
      setOpen(false)
      await refetch()
    } catch {
      setError('引用の保存に失敗しました')
    }
  }

  const onDelete = async (quote: Quote) => {
    if (!window.confirm('この引用を削除してもよろしいですか？')) return
    await deleteQuote({ variables: { input: { id: Number(quote.id) } } })
    await refetch()
  }

  return (
    <div className="px-4 pb-4">
      <div className="mb-2 flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">引用・抜き書き</h2>
        <button
          className="ml-auto rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 transition hover:bg-gray-50"
          onClick={() => setOpen(!open)}
        >
          {open ? '閉じる' : '引用を追加'}
        </button>
      </div>

      {open && (
        <div className="mb-4 rounded-lg border border-gray-200 p-3">
          <textarea
            value={text}
            placeholder="心に残った一節を書き写す"
            rows={3}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-2 flex gap-2">
            <input
              value={page}
              type="number"
              min={1}
              placeholder="ページ"
              className="w-24 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              onChange={(e) => setPage(e.target.value)}
            />
            <input
              value={comment}
              placeholder="ひとことコメント（任意）"
              className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              disabled={creating}
              onClick={onAdd}
            >
              追加
            </button>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        </div>
      )}

      {quotes.length === 0 && !open && (
        <p className="text-sm text-gray-400">
          まだ引用がありません。心に残った一節を残しておけます。
        </p>
      )}

      <div className="space-y-3">
        {quotes.map((quote) => (
          <div key={quote.id} className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <ImQuotesLeft className="mt-1 shrink-0 text-gray-300" />
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-wrap text-sm text-gray-800">
                  {quote.text}
                </p>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                  {quote.page && <span>P.{quote.page}</span>}
                  {quote.comment && <span>{quote.comment}</span>}
                </div>
              </div>
              <button
                className="shrink-0 rounded-full p-1 text-gray-300 transition hover:bg-gray-200 hover:text-gray-500"
                onClick={() => onDelete(quote)}
                aria-label="引用を削除"
              >
                <MdDelete size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
