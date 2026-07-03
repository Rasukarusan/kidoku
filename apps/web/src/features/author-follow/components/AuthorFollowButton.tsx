import { useMutation, useQuery } from '@apollo/client'
import {
  AuthorFollow,
  followedAuthorsQuery,
  followAuthorMutation,
  unfollowAuthorMutation,
} from '../api'

interface Props {
  author: string
}

// 著者フォローのトグルボタン（本詳細の著者名の横に表示）
export const AuthorFollowButton: React.FC<Props> = ({ author }) => {
  const name = author?.trim()
  const { data, refetch } = useQuery<{ followedAuthors: AuthorFollow[] }>(
    followedAuthorsQuery,
    { skip: !name || name === '-' }
  )
  const [followAuthor, { loading: following }] =
    useMutation(followAuthorMutation)
  const [unfollowAuthor, { loading: unfollowing }] = useMutation(
    unfollowAuthorMutation
  )

  if (!name || name === '-') return null

  const follow = data?.followedAuthors.find((f) => f.authorName === name)

  const onToggle = async () => {
    if (follow) {
      await unfollowAuthor({
        variables: { input: { id: Number(follow.id) } },
      })
    } else {
      await followAuthor({ variables: { input: { authorName: name } } })
    }
    await refetch()
  }

  return (
    <button
      className={`ml-2 rounded-full border px-3 py-0.5 text-xs transition ${
        follow
          ? 'border-teal-600 bg-teal-50 text-teal-700'
          : 'border-gray-300 text-gray-500 hover:bg-gray-50'
      }`}
      disabled={following || unfollowing}
      onClick={onToggle}
    >
      {follow ? 'フォロー中' : '著者をフォロー'}
    </button>
  )
}
