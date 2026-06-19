import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useAtom } from 'jotai'
import { openLoginModalAtom } from '@/store/modal/atom'
import { useCachedSession } from '@/hooks/useCachedSession'
import {
  followInfoQuery,
  followUserMutation,
  unfollowUserMutation,
} from '../api'

interface Props {
  /** プロフィール所有者のユーザー名 */
  name: string
  /** プロフィール所有者のユーザーID */
  userId: string
  /** フォロー状態が変わったときに呼ばれる（フォロワー数の即時更新などに使用） */
  onChanged?: (following: boolean) => void
}

export const FollowButton: React.FC<Props> = ({ name, userId, onChanged }) => {
  const { session, status } = useCachedSession()
  const [, setOpenLogin] = useAtom(openLoginModalAtom)
  const isSelf = status === 'authenticated' && session?.user?.id === userId

  const { data } = useQuery(followInfoQuery, {
    variables: { input: { name } },
    skip: status !== 'authenticated' || isSelf,
  })

  const [following, setFollowing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [followUser] = useMutation(followUserMutation)
  const [unfollowUser] = useMutation(unfollowUserMutation)

  useEffect(() => {
    if (data?.followInfo) setFollowing(data.followInfo.isFollowing)
  }, [data])

  if (isSelf) return null

  const handleClick = async () => {
    if (status !== 'authenticated') {
      setOpenLogin(true)
      return
    }
    if (busy) return
    setBusy(true)
    const next = !following
    setFollowing(next)
    onChanged?.(next)
    try {
      const input = { userId }
      if (next) {
        await followUser({ variables: { input } })
      } else {
        await unfollowUser({ variables: { input } })
      }
    } catch {
      setFollowing(!next)
      onChanged?.(!next)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={
        following
          ? 'whitespace-nowrap rounded-full border border-gray-300 px-5 py-1.5 text-sm font-bold text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-60'
          : 'whitespace-nowrap rounded-full bg-gray-900 px-5 py-1.5 text-sm font-bold text-white transition-colors hover:bg-gray-700 disabled:opacity-60'
      }
    >
      {following ? 'フォロー中' : 'フォロー'}
    </button>
  )
}
