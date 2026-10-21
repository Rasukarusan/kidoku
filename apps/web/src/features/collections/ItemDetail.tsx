import { FormEvent, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { NextSeo } from 'next-seo'
import { Item, ItemLog, ItemType, Collection } from './types'
import {
  deleteItemMutation,
  deleteLogMutation,
  itemQuery,
  saveLogMutation,
} from './api'
import { ItemForm } from './ItemForm'
import { Memo } from '@/features/sheet/components/Memo'
import { BookDetailReadModal } from '@/features/sheet/components/BookDetailReadModal'
import type { Book } from '@/types/book'

interface Props {
  item: Item
  user: { id: string; name: string }
  types: ItemType[]
  collections: Collection[]
}

export function ItemDetail(props: Props) {
  const { data: session } = useSession()
  const router = useRouter()
  const isMine = session?.user.id === props.item.userId
  const {
    data,
    error: queryError,
    refetch,
  } = useQuery(itemQuery, {
    variables: { id: props.item.id },
    skip: !isMine,
    fetchPolicy: 'cache-and-network',
  })
  const ownerItem: Item | null =
    isMine &&
    data?.item?.id === props.item.id &&
    data.item.userId === session.user.id
      ? data.item
      : null
  const canEdit = !!ownerItem
  const item: Item = ownerItem ?? props.item
  const types: ItemType[] = ownerItem ? data.itemTypes : props.types
  const collections: Collection[] = ownerItem
    ? data.collections
    : props.collections
  const type = types.find((type) => type.key === item.itemTypeId)
  const [editing, setEditing] = useState(false)
  const [log, setLog] = useState<{
    id?: number
    kind: string
    date: string
    memo: string
    rating: string
  } | null>(null)
  const [saveLog] = useMutation(saveLogMutation, {
    refetchQueries: ['CollectionItem', 'CollectionWorkspace', 'GetBooks'],
  })
  const [deleteLog] = useMutation(deleteLogMutation, {
    refetchQueries: ['CollectionItem', 'CollectionWorkspace', 'GetBooks'],
  })
  const [deleteItem] = useMutation(deleteItemMutation, {
    refetchQueries: ['CollectionWorkspace', 'GetBooks'],
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const base = `/${encodeURIComponent(props.user.name)}/collections`

  async function submitLog(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await saveLog({
        variables: {
          itemId: item.id,
          id: log.id,
          input: {
            kind: log.kind,
            occurredAt: log.date
              ? new Date(`${log.date}T00:00:00Z`).toISOString()
              : null,
            memo: log.memo,
            rating: log.rating === '-' ? null : log.rating,
          },
        },
      })
      setLog(null)
      await refetch()
    } catch (error) {
      setError(
        error instanceof Error ? error.message : '履歴を保存できませんでした'
      )
    } finally {
      setBusy(false)
    }
  }
  async function removeLog(value: ItemLog) {
    if (!window.confirm('この履歴を削除しますか？')) return
    setBusy(true)
    setError('')
    try {
      await deleteLog({ variables: { itemId: item.id, id: value.id } })
      await refetch()
    } catch (error) {
      setError(error instanceof Error ? error.message : '削除できませんでした')
    } finally {
      setBusy(false)
    }
  }
  async function removeItem() {
    if (
      !window.confirm(
        'このアイテムと履歴を削除しますか？すべてのコレクションから取り除かれます。'
      )
    )
      return
    setBusy(true)
    setError('')
    try {
      await deleteItem({ variables: { id: item.id } })
      await router.push(base)
    } catch (error) {
      setError(error instanceof Error ? error.message : '削除できませんでした')
    } finally {
      setBusy(false)
    }
  }
  if (editing && canEdit)
    return (
      <ItemForm
        key={item.id}
        item={item}
        onCancel={() => {
          setEditing(false)
          void refetch()
        }}
      />
    )

  // The old book presentation remains an adapter for existing purchases/comments.
  // Its storage and ownership checks use the canonical item model via the legacy API.
  const legacyBook: Book = {
    id: item.id,
    likeCount: item.likeCount ?? props.item.likeCount ?? 0,
    userId: item.userId,
    title: item.title,
    author: Array.isArray(item.attributes.authors)
      ? item.attributes.authors.join('、')
      : '',
    image: item.imageUrl,
    category: item.category,
    impression: item.rating,
    memo: item.memo,
    isPublicMemo: item.isPublicMemo,
    isPurchasable: item.isPurchasable,
    price: item.price,
    month: '1月',
    finished: item.logs.find((log) => log.kind === 'read')?.occurredAt ?? null,
    sheetId: item.collectionIds[0],
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
      <NextSeo
        title={`${item.title} | Kidoku`}
        description={`${type?.name ?? 'アイテム'}の記録`}
        openGraph={{
          images: [
            {
              url: `${process.env.NEXT_PUBLIC_HOST || 'https://kidoku.net'}/api/og?type=item&title=${encodeURIComponent(item.title)}&subtitle=${encodeURIComponent(type?.name ?? item.itemTypeId)}`,
              width: 1200,
              height: 630,
            },
          ],
        }}
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="パンくずリスト">
          <Link className="text-sm text-blue-700" href={base}>
            ← {props.user.name} のコレクション
          </Link>
        </nav>
        {canEdit && (
          <div className="flex gap-4">
            <button
              onClick={() => setEditing(true)}
              className="rounded-lg border px-4 py-2"
            >
              編集
            </button>
            <button
              disabled={busy}
              onClick={removeItem}
              className="text-sm text-red-700"
            >
              削除
            </button>
          </div>
        )}
      </div>
      {isMine && !ownerItem && !queryError && (
        <p className="mb-4 text-sm text-gray-500">
          編集用の記録を読み込み中...
        </p>
      )}
      {(error || (isMine && queryError)) && (
        <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-red-700">
          {error || queryError?.message}
        </p>
      )}
      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs">
          {type?.name ?? item.itemTypeId}
        </span>
        {collections
          .filter((collection) => item.collectionIds.includes(collection.id))
          .map((collection) => (
            <Link
              href={`${base}/${collection.id}`}
              key={collection.id}
              className="rounded-full border px-3 py-1 text-xs"
            >
              {collection.name}
            </Link>
          ))}
      </div>
      {item.itemTypeId === 'book' ? (
        <BookDetailReadModal
          key={session?.user.id ?? 'public'}
          book={legacyBook}
          onClose={() => {}}
          showComments
        />
      ) : (
        <section className="rounded-xl bg-white p-6">
          <img
            src={item.imageUrl || '/no-image.png'}
            alt=""
            className="mx-auto mb-6 max-h-72 object-contain"
          />
          <h1 className="text-center text-2xl font-bold">{item.title}</h1>
          <p className="mt-3 text-center text-gray-500">
            {item.category} {item.rating !== '-' ? ` · ${item.rating}` : ''}
          </p>
          <div className="mt-8">
            <h2 className="mb-3 text-lg font-bold">メモ</h2>
            {!isMine && !item.isPublicMemo ? (
              <p className="text-gray-500">このメモは非公開です</p>
            ) : (
              <Memo memo={item.memo} />
            )}
          </div>
        </section>
      )}
      <dl className="my-6 grid gap-3 rounded-xl border bg-white p-5">
        {type?.definition.fields.map(
          (field) =>
            item.attributes[field.key] !== undefined && (
              <div key={field.key} className="grid grid-cols-2 gap-3">
                <dt className="text-gray-500">{field.label}</dt>
                <dd>
                  {Array.isArray(item.attributes[field.key])
                    ? (item.attributes[field.key] as string[]).join('、')
                    : typeof item.attributes[field.key] === 'boolean'
                      ? item.attributes[field.key]
                        ? 'はい'
                        : 'いいえ'
                      : String(item.attributes[field.key])}
                </dd>
              </div>
            )
        )}
      </dl>
      <section className="mt-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            履歴{' '}
            <span className="text-sm font-normal text-gray-500">
              {item.logs.length}回
            </span>
          </h2>
          {canEdit && !!type?.definition.logKinds.length && (
            <button
              onClick={() =>
                setLog({
                  kind: type.definition.logKinds[0].key,
                  date: new Date().toISOString().slice(0, 10),
                  memo: '',
                  rating: '-',
                })
              }
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
            >
              ＋ 履歴を追加
            </button>
          )}
        </div>
        {log && canEdit && (
          <form
            onSubmit={submitLog}
            className="mb-5 space-y-4 rounded-xl border bg-white p-5"
          >
            <label className="block">
              種類
              <select
                value={log.kind}
                onChange={(event) =>
                  setLog({ ...log, kind: event.target.value })
                }
                className="mt-1 w-full rounded-lg border p-2"
              >
                {type?.definition.logKinds.map((kind) => (
                  <option key={kind.key} value={kind.key}>
                    {kind.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              {type?.definition.logKinds.find((kind) => kind.key === log.kind)
                ?.dateLabel ?? '日付'}
              <input
                type="date"
                value={log.date}
                onChange={(event) =>
                  setLog({ ...log, date: event.target.value })
                }
                className="mt-1 w-full rounded-lg border p-2"
              />
              <span className="text-xs text-gray-500">
                空欄は日付不明。期間集計には含めません。
              </span>
            </label>
            <label className="block">
              今回の評価
              <select
                value={log.rating}
                onChange={(event) =>
                  setLog({ ...log, rating: event.target.value })
                }
                className="mt-1 w-full rounded-lg border p-2"
              >
                {['-', '◎', '◯', '△', '✗'].map((rating) => (
                  <option key={rating}>{rating}</option>
                ))}
              </select>
            </label>
            <label className="block">
              今回のメモ（自分だけに表示）
              <textarea
                maxLength={100000}
                value={log.memo}
                onChange={(event) =>
                  setLog({ ...log, memo: event.target.value })
                }
                className="mt-1 min-h-24 w-full rounded-lg border p-2"
              />
            </label>
            <div className="flex gap-5">
              <button
                disabled={busy}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white"
              >
                保存
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => setLog(null)}
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
        {!item.logs.length && (
          <p className="rounded-xl border border-dashed p-6 text-gray-500">
            履歴はまだありません
          </p>
        )}
        <ol className="space-y-3">
          {item.logs.map((value) => (
            <li key={value.id} className="rounded-xl border bg-white p-5">
              <div className="flex justify-between gap-3">
                <div>
                  <span className="font-semibold">
                    {type?.definition.logKinds.find(
                      (kind) => kind.key === value.kind
                    )?.label ?? value.kind}
                  </span>
                  <span className="ml-3 text-sm text-gray-500">
                    {value.occurredAt?.slice(0, 10) ?? '日付不明'}
                    {isMine && value.rating ? ` · ${value.rating}` : ''}
                  </span>
                </div>
                {canEdit && (
                  <div className="flex gap-4 text-sm">
                    <button
                      disabled={busy}
                      onClick={() =>
                        setLog({
                          id: value.id,
                          kind: value.kind,
                          date: value.occurredAt?.slice(0, 10) ?? '',
                          memo: value.memo,
                          rating: value.rating ?? '-',
                        })
                      }
                      className="text-blue-700"
                    >
                      編集
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => removeLog(value)}
                      className="text-red-700"
                    >
                      削除
                    </button>
                  </div>
                )}
              </div>
              {isMine && value.memo && (
                <p className="mt-3 whitespace-pre-wrap text-sm">{value.memo}</p>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
