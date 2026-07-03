import { useState } from 'react'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import { useMutation, useQuery } from '@apollo/client'
import { Container } from '@/components/layout/Container'
import {
  RatingAxis,
  ratingAxesQuery,
  createRatingAxisMutation,
  deleteRatingAxisMutation,
} from '@/features/rating/api'

// 自分だけの評価軸(没入度・難易度など)を管理するページ
export const RatingAxesPage: React.FC = () => {
  const { data, refetch } = useQuery<{ ratingAxes: RatingAxis[] }>(
    ratingAxesQuery
  )
  const [createAxis, { loading: creating }] = useMutation(
    createRatingAxisMutation
  )
  const [deleteAxis] = useMutation(deleteRatingAxisMutation)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const axes = data?.ratingAxes ?? []

  const onAdd = async () => {
    setError('')
    if (!name.trim()) {
      setError('評価軸の名前を入力してください')
      return
    }
    try {
      await createAxis({ variables: { input: { name } } })
      setName('')
      await refetch()
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : '評価軸の作成に失敗しました'
      )
    }
  }

  const onDelete = async (axis: RatingAxis) => {
    if (
      !window.confirm(
        `「${axis.name}」を削除してもよろしいですか？この軸でつけた評価も削除されます。`
      )
    )
      return
    await deleteAxis({ variables: { input: { id: Number(axis.id) } } })
    await refetch()
  }

  return (
    <Container className="px-4 py-8 sm:px-10 sm:py-10">
      <NextSeo title="評価軸の設定 | kidoku" />
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">評価軸の設定</h2>
        <Link
          href="/settings/profile"
          className="text-sm text-blue-500 hover:underline"
        >
          設定に戻る
        </Link>
      </div>
      <p className="mb-6 text-sm text-gray-500">
        「没入度」「難易度」「再読したい度」など、自分だけの採点基準を最大10個まで作れます。
        本の詳細画面から5段階で採点できます。
      </p>

      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-bold text-gray-700">新しい評価軸</h3>
        <div className="flex gap-2">
          <input
            value={name}
            placeholder="例: 没入度"
            className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            disabled={creating}
            onClick={onAdd}
          >
            追加
          </button>
        </div>
        {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
      </section>

      {axes.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-bold text-gray-700">評価軸一覧</h3>
          <ul className="divide-y divide-slate-100">
            {axes.map((axis) => (
              <li
                key={axis.id}
                className="flex items-center justify-between py-3"
              >
                <span className="text-sm text-gray-800">{axis.name}</span>
                <button
                  className="rounded-md border border-red-200 px-3 py-1 text-xs text-red-500 transition hover:bg-red-50"
                  onClick={() => onDelete(axis)}
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  )
}
