import { useState } from 'react'
import { NextSeo } from 'next-seo'
import { useMutation, useQuery } from '@apollo/client'
import { Container } from '@/components/layout/Container'
import {
  AuthorFollow,
  AuthorNewRelease,
  followedAuthorsQuery,
  authorNewReleasesQuery,
  followAuthorMutation,
  unfollowAuthorMutation,
} from '../api'

// フォロー中の著者と、その新刊をチェックするページ
export const AuthorsPage: React.FC = () => {
  const { data, refetch } = useQuery<{ followedAuthors: AuthorFollow[] }>(
    followedAuthorsQuery
  )
  const [followAuthor, { loading: following }] =
    useMutation(followAuthorMutation)
  const [unfollowAuthor] = useMutation(unfollowAuthorMutation)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState('')
  const [error, setError] = useState('')

  const authors = data?.followedAuthors ?? []

  const { data: releasesData, loading: releasesLoading } = useQuery<{
    authorNewReleases: AuthorNewRelease[]
  }>(authorNewReleasesQuery, {
    variables: { input: { authorName: selected } },
    skip: !selected,
  })
  const releases = releasesData?.authorNewReleases ?? []

  const onFollow = async () => {
    setError('')
    if (!name.trim()) return
    try {
      await followAuthor({ variables: { input: { authorName: name } } })
      setName('')
      await refetch()
    } catch (e) {
      setError(
        e instanceof Error && e.message ? e.message : 'フォローに失敗しました'
      )
    }
  }

  const onUnfollow = async (author: AuthorFollow) => {
    if (!window.confirm(`「${author.authorName}」のフォローを外しますか？`))
      return
    await unfollowAuthor({ variables: { input: { id: Number(author.id) } } })
    if (selected === author.authorName) setSelected('')
    await refetch()
  }

  return (
    <Container className="px-4 py-8 sm:px-10 sm:py-10">
      <NextSeo title="著者フォロー | kidoku" noindex />
      <h2 className="mb-2 text-2xl font-bold">著者フォロー</h2>
      <p className="mb-6 text-sm text-gray-500">
        気になる著者をフォローしておくと、最新の刊行をここでまとめてチェックできます。あなただけに表示されます。
      </p>

      <div className="mb-6 flex gap-2">
        <input
          value={name}
          placeholder="著者名を入力（例: 村上春樹）"
          className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white sm:max-w-80"
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onFollow()
          }}
        />
        <button
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          disabled={following}
          onClick={onFollow}
        >
          フォロー
        </button>
      </div>
      {error && <div className="mb-4 text-xs text-red-600">{error}</div>}

      {authors.length === 0 && (
        <p className="text-sm text-gray-400">
          まだフォロー中の著者がいません。よく読む著者を追加してみましょう。
        </p>
      )}

      <div className="mb-8 flex flex-wrap gap-2">
        {authors.map((author) => (
          <span
            key={author.id}
            className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-sm transition ${
              author.authorName === selected
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-gray-700'
            }`}
          >
            <button
              onClick={() =>
                setSelected(
                  author.authorName === selected ? '' : author.authorName
                )
              }
            >
              {author.authorName}
            </button>
            <button
              className="ml-1 opacity-50 transition hover:opacity-100"
              onClick={() => onUnfollow(author)}
              aria-label={`${author.authorName}のフォローを外す`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      {selected && (
        <section>
          <h3 className="mb-4 text-sm font-bold text-gray-700">
            「{selected}」の最新刊行
          </h3>
          {releasesLoading && (
            <p className="text-sm text-gray-400">確認中...</p>
          )}
          {!releasesLoading && releases.length === 0 && (
            <p className="text-sm text-gray-400">
              刊行情報が見つかりませんでした。
            </p>
          )}
          <div className="space-y-3">
            {releases.map((release) => (
              <div
                key={`${release.id}-${release.title}`}
                className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4"
              >
                <img
                  src={release.image}
                  alt={release.title}
                  className="h-20 w-14 rounded object-cover shadow-sm"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-gray-800">
                    {release.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {release.author} ・ {release.category}
                  </div>
                  {release.salesDate && (
                    <div className="mt-1 text-xs text-teal-700">
                      発売日: {release.salesDate}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </Container>
  )
}
