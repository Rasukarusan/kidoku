import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from '@apollo/client'
import { AiOutlineTags } from 'react-icons/ai'
import { bookTagsQuery, setBookTagsMutation } from '../api'

interface Props {
  bookId: number
}

// 本詳細モーダル内のタグセクション（本人のみ表示）
export const TagSection: React.FC<Props> = ({ bookId }) => {
  const { data, refetch } = useQuery<{ bookTags: string[] }>(bookTagsQuery, {
    variables: { input: { bookId } },
  })
  const [setBookTags, { loading: saving }] = useMutation(setBookTagsMutation)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const tags = data?.bookTags ?? []

  const onEdit = () => {
    setInput(tags.join(', '))
    setError('')
    setEditing(true)
  }

  const onSave = async () => {
    setError('')
    const newTags = input
      .split(/[,、]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
    try {
      await setBookTags({
        variables: { input: { bookId, tags: newTags } },
        refetchQueries: ['MyTags'],
      })
      setEditing(false)
      await refetch()
    } catch {
      setError('タグの保存に失敗しました')
    }
  }

  return (
    <div className="px-4 pb-4">
      <div className="mb-2 flex items-center">
        <AiOutlineTags className="mr-1 text-gray-400" />
        <h2 className="text-lg font-semibold text-gray-800">タグ</h2>
        {!editing && (
          <button
            className="ml-auto rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-600 transition hover:bg-gray-50"
            onClick={onEdit}
          >
            編集
          </button>
        )}
      </div>

      {editing ? (
        <div>
          <input
            value={input}
            placeholder="カンマ区切りで入力（例: 哲学, 人に薦めたい）"
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="mt-2 flex items-center gap-2">
            <button
              className="rounded-md bg-slate-800 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              disabled={saving}
              onClick={onSave}
            >
              保存
            </button>
            <button
              className="rounded-md px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100"
              onClick={() => setEditing(false)}
            >
              キャンセル
            </button>
            {error && <span className="text-xs text-red-600">{error}</span>}
          </div>
        </div>
      ) : tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags?tag=${encodeURIComponent(tag)}`}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs text-gray-700 transition hover:bg-slate-200"
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400">
          タグをつけるとシートを跨いだ自分だけの本棚を作れます。
        </p>
      )}
    </div>
  )
}
