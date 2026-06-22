import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useCachedSession } from '@/hooks/useCachedSession'
import { getOrCreateAnonymousId } from '@/libs/anonymousId'
import { likeBookMutation, unlikeBookMutation } from '../api'

interface Props {
  bookId: number | string
  count: number
  liked: boolean
  /** ボタンサイズ（デフォルト18） */
  size?: number
}

export const LikeButton: React.FC<Props> = ({
  bookId,
  count: initialCount,
  liked: initialLiked,
  size = 18,
}) => {
  const { status } = useCachedSession()
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)
  const [like] = useMutation(likeBookMutation)
  const [unlike] = useMutation(unlikeBookMutation)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    const next = !liked
    // 楽観的更新
    setLiked(next)
    setCount((c) => Math.max(0, c + (next ? 1 : -1)))
    try {
      // 未ログインユーザーは Cookie の匿名IDでいいねする
      const anonymousId =
        status === 'authenticated' ? undefined : getOrCreateAnonymousId()
      const input = { bookId: Number(bookId), anonymousId }
      if (next) {
        const res = await like({ variables: { input } })
        setCount(res.data.likeBook)
      } else {
        const res = await unlike({ variables: { input } })
        setCount(res.data.unlikeBook)
      }
    } catch {
      // 失敗時はロールバック
      setLiked(!next)
      setCount((c) => Math.max(0, c + (next ? -1 : 1)))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      aria-pressed={liked}
      aria-label={liked ? 'いいねを取り消す' : 'いいねする'}
      className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-pink-500 disabled:opacity-60"
    >
      {liked ? (
        <FaHeart size={size} className="text-pink-500" />
      ) : (
        <FaRegHeart size={size} />
      )}
      <span className="tabular-nums">{count}</span>
    </button>
  )
}
