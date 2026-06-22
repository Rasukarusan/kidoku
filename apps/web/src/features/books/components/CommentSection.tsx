import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useAtom } from 'jotai'
import { FaRegTrashAlt } from 'react-icons/fa'
import { openLoginModalAtom } from '@/store/modal/atom'
import { useCachedSession } from '@/hooks/useCachedSession'
import { getLastModified } from '@/utils/string'
import { NO_IMAGE } from '@/libs/constants'
import {
  bookCommentsQuery,
  createBookCommentMutation,
  deleteBookCommentMutation,
} from '../api'

interface CommentItem {
  id: string
  bookId: number
  userId: string
  content: string
  created: string
  updated: string
  username: string
  userImage?: string | null
}

interface Props {
  bookId: number | string
  /** 本の所有者ID。投稿者本人に加えて本の所有者もコメントを削除できる */
  bookOwnerId?: string
}

const MAX_LENGTH = 1000

export const CommentSection: React.FC<Props> = ({ bookId, bookOwnerId }) => {
  const numericBookId = Number(bookId)
  const { session, status } = useCachedSession()
  const isAuthed = status === 'authenticated'
  const currentUserId = session?.user?.id
  const [, setOpenLogin] = useAtom(openLoginModalAtom)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { data, loading, refetch } = useQuery(bookCommentsQuery, {
    variables: { input: { bookId: numericBookId, limit: 50, offset: 0 } },
    fetchPolicy: 'cache-and-network',
  })
  const [createComment] = useMutation(createBookCommentMutation)
  const [deleteComment] = useMutation(deleteBookCommentMutation)

  const comments: CommentItem[] = data?.bookComments?.comments ?? []
  const total: number = data?.bookComments?.total ?? comments.length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthed) {
      setOpenLogin(true)
      return
    }
    const trimmed = content.trim()
    if (trimmed.length === 0 || submitting) return
    setSubmitting(true)
    try {
      await createComment({
        variables: { input: { bookId: numericBookId, content: trimmed } },
      })
      setContent('')
      await refetch()
    } catch {
      // 失敗時は入力内容を残す
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('このコメントを削除しますか？')) return
    try {
      await deleteComment({ variables: { input: { id: Number(id) } } })
      await refetch()
    } catch {
      // 失敗時は何もしない
    }
  }

  const canDelete = (comment: CommentItem) =>
    isAuthed &&
    (comment.userId === currentUserId || bookOwnerId === currentUserId)

  return (
    <div className="px-4 pb-24">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">
        コメント
        {total > 0 && (
          <span className="ml-2 text-sm font-normal text-gray-500">
            {total}
          </span>
        )}
      </h2>

      {/* 投稿フォーム */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={MAX_LENGTH}
          rows={3}
          placeholder={
            isAuthed
              ? 'この感想にコメントする'
              : 'ログインするとコメントできます'
          }
          onFocusCapture={() => {
            if (!isAuthed) setOpenLogin(true)
          }}
          className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {content.length}/{MAX_LENGTH}
          </span>
          <button
            type="submit"
            disabled={submitting || content.trim().length === 0}
            className="rounded-full bg-slate-800 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? '送信中...' : 'コメントする'}
          </button>
        </div>
      </form>

      {/* コメント一覧 */}
      {loading && comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">読み込み中...</p>
      ) : comments.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-400">
          まだコメントはありません。最初のコメントを投稿してみましょう。
        </p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <img
                src={comment.userImage || NO_IMAGE}
                alt=""
                className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">
                    {comment.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {getLastModified(comment.created)}
                  </span>
                  {canDelete(comment) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      aria-label="コメントを削除"
                      className="ml-auto text-gray-300 transition-colors hover:text-red-500"
                    >
                      <FaRegTrashAlt size={13} />
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-700">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
