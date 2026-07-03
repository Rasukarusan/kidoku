import Link from 'next/link'
import { useMutation, useQuery } from '@apollo/client'
import { FaStar, FaRegStar } from 'react-icons/fa'
import { MdClose } from 'react-icons/md'
import {
  RatingAxis,
  BookRating,
  ratingAxesQuery,
  bookRatingsQuery,
  setBookRatingMutation,
} from '../api'

interface Props {
  bookId: number
}

// 本詳細モーダル内の自分軸評価セクション（本人のみ表示）
export const RatingSection: React.FC<Props> = ({ bookId }) => {
  const { data: axesData } = useQuery<{ ratingAxes: RatingAxis[] }>(
    ratingAxesQuery
  )
  const { data: ratingsData, refetch } = useQuery<{
    bookRatings: BookRating[]
  }>(bookRatingsQuery, { variables: { input: { bookId } } })
  const [setBookRating] = useMutation(setBookRatingMutation)

  const axes = axesData?.ratingAxes ?? []
  const ratings = new Map(
    (ratingsData?.bookRatings ?? []).map((rating) => [
      rating.axisId,
      rating.value,
    ])
  )

  if (axes.length === 0) return null

  const onRate = async (axisId: number, value: number | null) => {
    await setBookRating({
      variables: { input: { bookId, axisId, value } },
    })
    await refetch()
  }

  return (
    <div className="px-4 pb-4">
      <div className="mb-2 flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">自分軸評価</h2>
        <Link
          href="/settings/rating-axes"
          className="ml-auto text-xs text-gray-400 hover:underline"
        >
          軸を編集
        </Link>
      </div>
      <div className="space-y-2">
        {axes.map((axis) => {
          const axisId = Number(axis.id)
          const value = ratings.get(axisId) ?? 0
          return (
            <div key={axis.id} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-sm text-gray-600">
                {axis.name}
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onRate(axisId, star)}
                    aria-label={`${axis.name}を${star}にする`}
                  >
                    {star <= value ? (
                      <FaStar className="text-amber-400" size={18} />
                    ) : (
                      <FaRegStar className="text-gray-300" size={18} />
                    )}
                  </button>
                ))}
              </div>
              {value > 0 && (
                <button
                  className="rounded-full p-0.5 text-gray-300 transition hover:bg-gray-200 hover:text-gray-500"
                  onClick={() => onRate(axisId, null)}
                  aria-label={`${axis.name}の評価を解除`}
                >
                  <MdClose size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
