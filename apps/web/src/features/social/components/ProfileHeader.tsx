import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { NO_IMAGE } from '@/libs/constants'
import { userImageQuery } from '@/features/user/api'
import { followCountsQuery } from '../api'
import { FollowButton } from './FollowButton'

interface Props {
  /** プロフィール所有者のユーザー名 */
  username: string
  /** プロフィール所有者のユーザーID */
  userId: string
}

/**
 * 本棚ページ上部のプロフィールヘッダー。
 * アバター・ユーザー名・フォロワー/フォロー数・フォローボタンをまとめて表示する。
 */
export const ProfileHeader: React.FC<Props> = ({ username, userId }) => {
  const { data: countsData } = useQuery(followCountsQuery, {
    variables: { input: { name: username } },
  })
  const { data: imageData } = useQuery(userImageQuery, {
    variables: { input: { name: username } },
  })

  const [followers, setFollowers] = useState<number | null>(null)
  useEffect(() => {
    if (countsData?.followCounts) {
      setFollowers(countsData.followCounts.followers)
    }
  }, [countsData])

  const following: number = countsData?.followCounts?.following ?? 0
  const image = imageData?.userImage || NO_IMAGE

  return (
    <div className="flex items-center gap-4 px-1 py-4">
      <img
        src={image}
        alt={`${username}のプロフィール画像`}
        className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-gray-200"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-lg font-bold">{username}</div>
        <div className="mt-0.5 text-sm text-gray-500">
          <span className="font-semibold text-gray-700">
            {followers ?? '–'}
          </span>{' '}
          フォロワー
          <span className="mx-1.5">・</span>
          <span className="font-semibold text-gray-700">{following}</span>{' '}
          フォロー
        </div>
      </div>
      <FollowButton
        name={username}
        userId={userId}
        onChanged={(isFollowing) =>
          setFollowers((c) => Math.max(0, (c ?? 0) + (isFollowing ? 1 : -1)))
        }
      />
    </div>
  )
}
