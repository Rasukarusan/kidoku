import { SuiPriceInput } from '@/components/input/SuiPriceInput'
import { mySuiAddressQuery } from '@/features/user/api/queries'
import { FormEvent, useState } from 'react'
import dynamic from 'next/dynamic'
import { useMutation, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useSetAtom } from 'jotai'
import { openLoginModalAtom, openSearchModalAtom } from '@/store/modal/atom'
import { ImagePicker } from '@/components/button/ImagePicker'
import { definitionsQuery, saveItemMutation } from './api'
import { Collection, Item, ItemType } from './types'

const MarkdownEditor = dynamic(
  () =>
    import('@/components/input/MarkdownEditor').then(
      (module) => module.MarkdownEditor
    ),
  { ssr: false }
)
const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900'

export function ItemForm({
  item,
  onCancel,
}: {
  item?: Item
  onCancel?: () => void
}) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const login = useSetAtom(openLoginModalAtom)
  const searchBooks = useSetAtom(openSearchModalAtom)
  const {
    data,
    loading,
    error: queryError,
  } = useQuery<{ itemTypes: ItemType[]; collections: Collection[] }>(
    definitionsQuery,
    { skip: !session }
  )
  const [save] = useMutation(saveItemMutation, {
    refetchQueries: [
      'CollectionWorkspace',
      'CollectionItem',
      'GetBooks',
      'GetSheets',
    ],
  })
  const [typeKey, setTypeKey] = useState(item?.itemTypeId ?? 'book')
  const [title, setTitle] = useState(item?.title ?? '')
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? '/no-image.png')
  const [category, setCategory] = useState(item?.category ?? '')
  const purchaseFeature = process.env.NEXT_PUBLIC_FLAG_KIDOKU_1 === 'true'
  const { data: addressData } = useQuery(mySuiAddressQuery, {
    skip: !session || !purchaseFeature,
  })
  const [isPurchasable, setPurchasable] = useState(item?.isPurchasable ?? false)
  const [price, setPrice] = useState<string | null>(item?.price ?? null)
  const [rating, setRating] = useState(item?.rating ?? '-')
  const [memo, setMemo] = useState(item?.memo ?? '')
  const [isPublicMemo, setPublicMemo] = useState(item?.isPublicMemo ?? false)
  const [attributes, setAttributes] = useState<
    Record<string, string | string[] | number | boolean>
  >(item?.attributes ?? {})
  const [collectionIds, setCollectionIds] = useState<number[]>(
    item?.collectionIds ??
      (Number(router.query.collection) > 0
        ? [Number(router.query.collection)]
        : [])
  )
  const [recordNow, setRecordNow] = useState(false)
  const [kind, setKind] = useState('')
  const [date, setDate] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const ownCollections =
    data?.collections.filter(
      (collection) => collection.userId === session?.user.id
    ) ?? []
  const type = data?.itemTypes.find((type) => type.key === typeKey)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!session || !type) return
    setBusy(true)
    setError('')
    try {
      let savedImage = imageUrl
      if (imageUrl.startsWith('data:')) {
        const response = await fetch('/api/items/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageUrl }),
        })
        const result = await response.json()
        if (!response.ok)
          throw new Error(result.error || '画像を保存できませんでした')
        savedImage = result.url
        setImageUrl(savedImage)
      }
      const normalized = { ...attributes }
      for (const field of type.definition.fields) {
        const value = normalized[field.key]
        if (field.type === 'textList' && value !== undefined) {
          normalized[field.key] = (
            Array.isArray(value) ? value : String(value).split('、')
          )
            .map((value) => value.trim())
            .filter(Boolean)
        }
      }
      const cleaned = Object.fromEntries(
        Object.entries(normalized).filter(
          ([, value]) =>
            value !== '' &&
            value !== undefined &&
            (!Array.isArray(value) || value.length)
        )
      )
      const result = await save({
        variables: {
          input: {
            ...(item ? { id: item.id } : {}),
            itemTypeId: typeKey,
            title,
            imageUrl: savedImage,
            category,
            rating,
            memo,
            isPublicMemo,
            ...(purchaseFeature && typeKey === 'book'
              ? { isPurchasable, price }
              : {}),
            attributes: cleaned,
            collectionIds,
            ...(!item && recordNow
              ? {
                  initialLog: {
                    kind: kind || type.definition.logKinds[0]?.key,
                    occurredAt: date
                      ? new Date(`${date}T00:00:00Z`).toISOString()
                      : null,
                    memo: '',
                    rating: null,
                  },
                }
              : {}),
          },
        },
      })
      if (item) onCancel?.()
      else await router.push(`/items/${result.data.saveItem.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : '保存できませんでした')
    } finally {
      setBusy(false)
    }
  }

  if (status === 'loading' || loading)
    return <p className="p-8">読み込み中...</p>
  if (!session)
    return (
      <div className="p-8">
        <button
          className="rounded-lg bg-blue-600 px-5 py-3 text-white"
          onClick={() => login(true)}
        >
          ログインして登録する
        </button>
      </div>
    )
  if (queryError)
    return (
      <p role="alert" className="p-8 text-red-700">
        種類を取得できませんでした。{queryError.message}
      </p>
    )

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6 p-5 pb-24">
      <h1 className="text-2xl font-bold">
        {item ? 'アイテムを編集' : 'コレクションにアイテムを追加'}
      </h1>
      <label className="block">
        種類
        <select
          className={inputClass}
          value={typeKey}
          disabled={!!item || busy}
          onChange={(event) => {
            setTypeKey(event.target.value)
            setAttributes({})
            setKind('')
            setRecordNow(false)
          }}
        >
          {data?.itemTypes.map((type) => (
            <option key={type.key} value={type.key}>
              {type.name}
            </option>
          ))}
        </select>
      </label>
      {!item && type?.definition.searchProvider === 'books' && (
        <button
          type="button"
          className="text-blue-700 underline"
          onClick={() => searchBooks(true)}
        >
          タイトル・ISBN・バーコードから本を探す
        </button>
      )}
      <label className="block">
        タイトル
        <input
          required
          maxLength={100}
          className={inputClass}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <div>
        <p className="mb-2">画像</p>
        <ImagePicker img={imageUrl} onImageLoad={setImageUrl} />
        <label className="mt-3 block text-sm">
          画像URL
          <input
            type={imageUrl.startsWith('data:') ? 'text' : 'url'}
            className={inputClass}
            value={
              imageUrl === '/no-image.png' || imageUrl.startsWith('data:')
                ? ''
                : imageUrl
            }
            onChange={(event) =>
              setImageUrl(event.target.value || '/no-image.png')
            }
            placeholder="https://..."
          />
        </label>
      </div>
      {type?.definition.fields.map((field) => (
        <label key={`${typeKey}:${field.key}`} className="block">
          {field.label}
          {field.required && '（必須）'}
          {field.type === 'boolean' ? (
            <input
              type="checkbox"
              className="ml-3"
              checked={attributes[field.key] === true}
              onChange={(event) =>
                setAttributes({
                  ...attributes,
                  [field.key]: event.target.checked,
                })
              }
            />
          ) : (
            <input
              className={inputClass}
              required={field.required}
              type={field.type === 'number' ? 'number' : 'text'}
              min={field.min}
              max={field.max}
              step={field.type === 'number' ? 1 : undefined}
              maxLength={
                field.type === 'textList' ? undefined : field.maxLength
              }
              value={
                Array.isArray(attributes[field.key])
                  ? (attributes[field.key] as string[]).join('、')
                  : String(attributes[field.key] ?? '')
              }
              onChange={(event) =>
                setAttributes({
                  ...attributes,
                  [field.key]:
                    field.type === 'number' && event.target.value !== ''
                      ? Number(event.target.value)
                      : event.target.value,
                })
              }
            />
          )}
          {field.type === 'textList' && (
            <span className="text-xs text-gray-500">
              複数ある場合は「、」で区切ってください
            </span>
          )}
        </label>
      ))}
      <div className="grid grid-cols-2 gap-4">
        <label>
          カテゴリ
          <input
            maxLength={120}
            className={inputClass}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </label>
        <label>
          総合評価
          <select
            className={inputClass}
            value={rating}
            onChange={(event) => setRating(event.target.value)}
          >
            {['-', '◎', '◯', '△', '✗'].map((rating) => (
              <option key={rating}>{rating}</option>
            ))}
          </select>
        </label>
      </div>
      <fieldset>
        <legend className="mb-2 font-semibold">コレクション</legend>
        <div className="flex flex-wrap gap-3">
          {ownCollections.map((collection) => (
            <label
              className="rounded-lg border bg-white px-3 py-2"
              key={collection.id}
            >
              <input
                className="mr-2"
                type="checkbox"
                checked={collectionIds.includes(collection.id)}
                onChange={(event) =>
                  setCollectionIds(
                    event.target.checked
                      ? [...collectionIds, collection.id]
                      : collectionIds.filter((id) => id !== collection.id)
                  )
                }
              />
              {collection.name}
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          複数選択できます。未所属でも保存できます。
        </p>
      </fieldset>
      <div>
        <p className="mb-2">メモ</p>
        <MarkdownEditor value={memo} onChange={setMemo} minHeight="160px" />
      </div>
      <label className="block">
        <input
          type="checkbox"
          className="mr-2"
          checked={isPublicMemo}
          onChange={(event) => setPublicMemo(event.target.checked)}
        />
        メモを公開する
      </label>
      {purchaseFeature && typeKey === 'book' && (
        <fieldset className="space-y-3 rounded-xl border p-4">
          <label className="block">
            <input
              type="checkbox"
              className="mr-2"
              checked={isPurchasable}
              disabled={!addressData?.mySuiAddress && !isPurchasable}
              onChange={(event) => setPurchasable(event.target.checked)}
            />
            非公開メモを購入可能にする
          </label>
          {!addressData?.mySuiAddress && (
            <p className="text-sm text-gray-500">
              設定でSui受取アドレスを登録してください。
            </p>
          )}
          {isPurchasable && (
            <SuiPriceInput
              valueMist={price}
              onChange={setPrice}
              disabled={busy}
            />
          )}
        </fieldset>
      )}
      {!item && !!type?.definition.logKinds.length && (
        <fieldset className="rounded-xl border bg-white p-4">
          <label>
            <input
              type="checkbox"
              className="mr-2"
              checked={recordNow}
              onChange={(event) => setRecordNow(event.target.checked)}
            />
            履歴も記録する
          </label>
          {recordNow && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label>
                履歴の種類
                <select
                  className={inputClass}
                  value={kind || type.definition.logKinds[0].key}
                  onChange={(event) => setKind(event.target.value)}
                >
                  {type.definition.logKinds.map((kind) => (
                    <option key={kind.key} value={kind.key}>
                      {kind.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {
                  type.definition.logKinds.find(
                    (value) =>
                      value.key === (kind || type.definition.logKinds[0].key)
                  )?.dateLabel
                }
                <input
                  className={inputClass}
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
                <span className="text-xs text-gray-500">
                  空欄は日付不明として記録します
                </span>
              </label>
            </div>
          )}
        </fieldset>
      )}
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}
      <div className="flex gap-3">
        <button
          disabled={busy || !type}
          className="rounded-lg bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-50"
        >
          {busy ? '保存中...' : '保存する'}
        </button>
        {onCancel && (
          <button
            disabled={busy}
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-5 py-3"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  )
}
