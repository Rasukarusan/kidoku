import { collectionSummary } from './summary'
import { ReadingAnalysis } from './ReadingAnalysis'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import { Collection, Item, ItemType } from './types'
import {
  deleteCollectionMutation,
  saveCollectionMutation,
  workspaceQuery,
  setHighlightMutation,
} from './api'

export interface CollectionPageProps {
  user: { id: string; name: string }
  collections: Collection[]
  items: Item[]
  types: ItemType[]
  collectionId?: number
}

export function CollectionPage(props: CollectionPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const isMine = session?.user.id === props.user.id
  const {
    data,
    error: queryError,
    refetch,
  } = useQuery(workspaceQuery, {
    skip: !isMine,
    fetchPolicy: 'cache-and-network',
  })
  const [saveCollection] = useMutation(saveCollectionMutation, {
    refetchQueries: [
      'CollectionWorkspace',
      'CollectionDefinitions',
      'GetSheets',
    ],
  })
  const [deleteCollection] = useMutation(deleteCollectionMutation, {
    refetchQueries: [
      'CollectionWorkspace',
      'CollectionDefinitions',
      'GetSheets',
    ],
  })
  const [setHighlight] = useMutation(setHighlightMutation, {
    refetchQueries: ['CollectionWorkspace'],
  })
  const ownerData =
    isMine &&
    data?.items?.every((item: Item) => item.userId === props.user.id) &&
    data?.collections?.every(
      (collection: Collection) => collection.userId === props.user.id
    )
      ? data
      : null
  const collections: Collection[] = ownerData
    ? ownerData.collections
    : props.collections
  const items: Item[] = ownerData ? ownerData.items : props.items
  const types: ItemType[] = ownerData ? ownerData.itemTypes : props.types
  const current = collections.find(
    (collection) => collection.id === props.collectionId
  )
  const [type, setType] = useState('')
  const [year, setYear] = useState('')
  const [logKind, setLogKind] = useState('')
  const [query, setQuery] = useState(
    typeof router.query.q === 'string' ? router.query.q : ''
  )
  const [unassigned, setUnassigned] = useState(false)
  const [editor, setEditor] = useState<{
    id?: number
    name: string
    description: string
  } | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const base = `/${encodeURIComponent(props.user.name)}/collections`
  useEffect(() => {
    setType('')
    setYear('')
    setLogKind('')
    setQuery(typeof router.query.q === 'string' ? router.query.q : '')
    setUnassigned(false)
    setEditor(null)
  }, [props.collectionId, router.query.q])
  const scoped = useMemo(
    () =>
      items.filter(
        (item) =>
          !props.collectionId || item.collectionIds.includes(props.collectionId)
      ),
    [items, props.collectionId]
  )
  const years = [
    ...new Set(
      scoped.flatMap((item) =>
        item.logs
          .filter((log) => log.occurredAt)
          .map((log) => log.occurredAt.slice(0, 4))
      )
    ),
  ]
    .sort()
    .reverse()
  const {
    items: visible,
    logCount,
    monthly,
  } = collectionSummary(scoped, {
    itemTypeId: type,
    year,
    query,
    unassigned,
    logKind,
  })
  const logKinds = [
    ...new Map(
      types
        .filter((value) => !type || value.key === type)
        .flatMap((value) => value.definition.logKinds)
        .map((kind) => [kind.key, kind])
    ).values(),
  ]
  const unit = type
    ? (types.find((value) => value.key === type)?.definition.itemUnit ?? '件')
    : '件'

  async function submit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await saveCollection({ variables: { input: editor } })
      setEditor(null)
      await refetch()
    } catch (error) {
      setError(error instanceof Error ? error.message : '保存できませんでした')
    } finally {
      setBusy(false)
    }
  }
  async function chooseHighlight(position: number, itemId: number | null) {
    if (!current) return
    setBusy(true)
    setError('')
    try {
      await setHighlight({
        variables: { collectionId: current.id, position, itemId },
      })
      await refetch()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'お気に入りを保存できませんでした'
      )
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (
      !current ||
      !window.confirm(
        `「${current.name}」を削除しますか？アイテムと履歴は残ります。`
      )
    )
      return
    setBusy(true)
    setError('')
    try {
      await deleteCollection({ variables: { id: current.id } })
      await router.push(base)
    } catch (error) {
      setError(error instanceof Error ? error.message : '削除できませんでした')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24">
      <NextSeo
        title={`${current?.name ?? 'コレクション'} | ${props.user.name} | Kidoku`}
      />
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-sm text-gray-500">
            {props.user.name} のコレクション
          </p>
          <h1 className="text-3xl font-bold">
            {current?.name ?? 'すべてのアイテム'}
          </h1>
          {current?.description && (
            <p className="mt-3 whitespace-pre-wrap text-gray-600">
              {current.description}
            </p>
          )}
        </div>
        {isMine && (
          <Link
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
            href={`/items/new${current ? `?collection=${current.id}` : ''}`}
          >
            ＋ アイテムを追加
          </Link>
        )}
      </header>
      {isMine && (
        <div className="mb-5 flex gap-4 text-sm text-blue-700">
          <a href="/api/export/items">CSVエクスポート</a>
          <a href="/api/export/items?format=json">JSONエクスポート</a>
        </div>
      )}
      <nav aria-label="コレクション" className="mb-6 flex flex-wrap gap-2">
        <Link
          className={`rounded-full border px-4 py-2 ${!current ? 'bg-gray-900 text-white' : 'bg-white'}`}
          href={base}
        >
          すべて
        </Link>
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`${base}/${collection.id}`}
            className={`rounded-full border px-4 py-2 ${current?.id === collection.id ? 'bg-gray-900 text-white' : 'bg-white'}`}
          >
            {collection.name}
            <span className="ml-2 text-xs opacity-70">
              {collection.itemCount}
            </span>
          </Link>
        ))}
        {isMine && (
          <button
            className="rounded-full border border-dashed px-4 py-2"
            onClick={() => setEditor({ name: '', description: '' })}
          >
            ＋ コレクション
          </button>
        )}
      </nav>
      {current && isMine && (
        <div className="mb-6 flex gap-4 text-sm">
          <button
            onClick={() =>
              setEditor({
                id: current.id,
                name: current.name,
                description: current.description,
              })
            }
            className="text-blue-700"
          >
            名前・説明を編集
          </button>
          <button disabled={busy} onClick={remove} className="text-red-700">
            コレクションを削除
          </button>
        </div>
      )}
      {editor && (
        <form
          onSubmit={submit}
          className="mb-8 space-y-3 rounded-xl border bg-white p-5"
        >
          <label className="block">
            コレクション名
            <input
              required
              maxLength={120}
              value={editor.name}
              onChange={(event) =>
                setEditor({ ...editor, name: event.target.value })
              }
              className="mt-1 w-full rounded-lg border p-2"
            />
          </label>
          <label className="block">
            説明
            <textarea
              maxLength={10000}
              value={editor.description}
              onChange={(event) =>
                setEditor({ ...editor, description: event.target.value })
              }
              className="mt-1 w-full rounded-lg border p-2"
            />
          </label>
          <div className="flex gap-4">
            <button
              disabled={busy}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white"
            >
              保存
            </button>
            <button
              disabled={busy}
              type="button"
              onClick={() => setEditor(null)}
            >
              キャンセル
            </button>
          </div>
        </form>
      )}
      {(error || (isMine && queryError)) && (
        <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-red-700">
          {error || queryError?.message}
        </p>
      )}
      <div className="mb-6 flex flex-wrap gap-3">
        <label>
          <span className="sr-only">種類で絞り込み</span>
          <select
            aria-label="種類で絞り込み"
            value={type}
            onChange={(event) => {
              setType(event.target.value)
              setLogKind('')
            }}
            className="rounded-lg border bg-white p-2"
          >
            <option value="">すべての種類</option>
            {types.map((type) => (
              <option key={type.key} value={type.key}>
                {type.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">履歴の年</span>
          <select
            aria-label="履歴の年"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="rounded-lg border bg-white p-2"
          >
            <option value="">すべての期間</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </label>
        <select
          aria-label="履歴の種類"
          value={logKind}
          onChange={(event) => setLogKind(event.target.value)}
          className="rounded-lg border bg-white p-2"
        >
          <option value="">すべての履歴</option>
          {logKinds.map((kind) => (
            <option key={kind.key} value={kind.key}>
              {kind.label}
            </option>
          ))}
        </select>
        <input
          aria-label="タイトル検索"
          type="search"
          placeholder="タイトルで絞り込み"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 rounded-lg border bg-white p-2"
        />
        {!current && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={unassigned}
              onChange={(event) => setUnassigned(event.target.checked)}
            />
            未所属のみ
          </label>
        )}
      </div>
      <div className="mb-8 flex gap-8 rounded-xl bg-white p-5">
        <div>
          <p className="text-sm text-gray-500">アイテム</p>
          <p className="mt-1 text-2xl font-bold">
            {visible.length}
            <span className="ml-1 text-sm font-normal">{unit}</span>
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">
            {year ? `${year}年の履歴` : '履歴'}
          </p>
          <p className="mt-1 text-2xl font-bold">
            {logCount}
            <span className="ml-1 text-sm font-normal">回</span>
          </p>
        </div>
      </div>
      {current && (
        <section className="mb-8 rounded-xl border bg-white p-5">
          <h2 className="mb-4 font-bold">コレクションのお気に入り</h2>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((position) => {
              const itemId = current.highlights?.find(
                (highlight) => highlight.position === position
              )?.itemId
              const favorite = scoped.find((item) => item.id === itemId)
              return (
                <div key={position} className="min-w-0">
                  <p className="mb-2 text-sm text-gray-500">{position}位</p>
                  {favorite ? (
                    <Link href={`/items/${favorite.id}`}>
                      <img
                        src={favorite.imageUrl || '/no-image.png'}
                        alt=""
                        className="mb-2 h-28 max-w-full object-contain"
                      />
                      <p className="line-clamp-2 text-sm">{favorite.title}</p>
                    </Link>
                  ) : (
                    <p className="py-4 text-sm text-gray-400">未設定</p>
                  )}
                  {isMine && (
                    <select
                      aria-label={`お気に入り${position}位`}
                      disabled={busy}
                      className="mt-3 w-full rounded border p-2 text-sm"
                      value={itemId ?? ''}
                      onChange={(event) =>
                        chooseHighlight(
                          position,
                          event.target.value ? Number(event.target.value) : null
                        )
                      }
                    >
                      <option value="">未設定</option>
                      {scoped.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
      {monthly.length > 0 && (
        <section className="mb-8 rounded-xl border bg-white p-5">
          <h2 className="mb-4 font-bold">月ごとの履歴数</h2>
          <div className="flex max-h-72 flex-col gap-2 overflow-auto">
            {monthly.map(([month, count]) => (
              <div key={month} className="flex items-center gap-3 text-sm">
                <span className="w-16 shrink-0">{month}</span>
                <div
                  className="h-3 rounded bg-blue-400"
                  style={{
                    width: `${(count / Math.max(...monthly.map(([, value]) => value))) * 70}%`,
                  }}
                />
                <span>{count}回</span>
              </div>
            ))}
          </div>
        </section>
      )}
      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed p-14 text-center text-gray-500">
          {scoped.length
            ? '条件に一致するアイテムはありません'
            : 'アイテムを追加して、コレクションをはじめましょう'}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {visible.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="overflow-hidden rounded-xl border bg-white transition-shadow hover:shadow-md"
            >
              <div className="flex h-48 items-center justify-center bg-gray-50 p-3">
                <img
                  src={item.imageUrl || '/no-image.png'}
                  alt=""
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="p-4">
                <span className="mb-2 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {types.find((type) => type.key === item.itemTypeId)?.name ??
                    item.itemTypeId}
                </span>
                <h2 className="line-clamp-2 font-semibold">{item.title}</h2>
                <p className="mt-2 text-xs text-gray-500">
                  {item.rating !== '-' ? `${item.rating} · ` : ''}
                  {item.logs.length}回の履歴
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {isMine && current && (
        <ReadingAnalysis
          key={`${props.user.id}:${current.id}`}
          items={scoped}
          username={props.user.name}
          collectionName={current.name}
        />
      )}
    </div>
  )
}
