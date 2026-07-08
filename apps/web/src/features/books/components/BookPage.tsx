import Link from 'next/link'
import { useRouter } from 'next/router'
import { Book } from '@/types/book'
import { BookDetailReadModal } from '@/features/sheet/components/BookDetailReadModal'
import { BookDetailEditPage } from '@/features/sheet/components/BookDetailEditPage'
import { useCallback, useEffect, useState } from 'react'
import { MdChevronRight } from 'react-icons/md'
import { useIsBookOwner } from '@/hooks/useIsBookOwner'
import apolloClient from '@/libs/apollo'
import { getBookQuery } from '@/features/books/api/queries'
import { NextSeo } from 'next-seo'
import { JsonLd } from '@/components/seo/JsonLd'

interface BookPageProps {
  book: Book | null
}

export default function BookPage({ book: initialBook }: BookPageProps) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [book, setBook] = useState(initialBook)
  const isOwner = useIsBookOwner(book)

  // ナビゲーション時にpropsの変更を反映
  useEffect(() => {
    setBook(initialBook)
    setEditMode(false)
  }, [initialBook])

  // 所有者向けに、マスクされていない完全なメモをGraphQL経由で取得する。
  // ISRで生成されるpropsのメモはマスク済み(*****)のため、所有者には元の
  // メモ（[[MASK: ...]]アノテーション付き）を取得し直す必要がある。
  const fetchOwnerMemo = useCallback(async () => {
    if (!isOwner || !book?.id) return
    try {
      const { data } = await apolloClient.query({
        query: getBookQuery,
        variables: { input: { id: String(book.id) } },
        fetchPolicy: 'network-only',
      })
      if (data?.book?.memo !== undefined) {
        setBook((prev) => (prev ? { ...prev, memo: data.book.memo } : prev))
      }
    } catch {
      // フォールバック: ISRで生成されたデータをそのまま使用
    }
  }, [isOwner, book?.id])

  // 所有者の場合、ページ表示時に完全なメモデータを取得
  useEffect(() => {
    fetchOwnerMemo()
  }, [fetchOwnerMemo])

  if (!book) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-800">
            書籍が見つかりません
          </h1>
          <button
            onClick={() => router.back()}
            className="text-blue-600 underline hover:text-blue-800"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  const handleClose = () => {
    router.back()
  }

  // 保存成功時: 編集結果を即座に表示へ反映して読み取りモードに戻す。
  // ISRのpropsは非同期に再生成されるため、それを待つと保存直後に古い内容が
  // 表示されてしまう。保存済みデータでローカル状態を更新して即時反映する。
  const handleSaved = (updatedBook: Book) => {
    setBook(updatedBook)
    setEditMode(false)
  }

  const handleEditToggle = async () => {
    // 編集モードに入る際は、マスクされていない最新のメモを取得してから切り替える。
    // ISR直後の再取得が完了する前に編集ボタンを押すと、マスク済みメモ(*****)が
    // 編集フォームに表示されてしまうため、ここで取得完了を待つ。
    if (!editMode) {
      await fetchOwnerMemo()
    }
    setEditMode((prev) => !prev)
  }

  const sheetUrl =
    book.user && book.sheet ? `/${book.user.name}/sheets/${book.sheet}` : null
  const host = process.env.NEXT_PUBLIC_HOST || 'https://kidoku.net'
  const coverImageParam =
    book.image && /^https?:\/\//.test(book.image)
      ? `&image=${encodeURIComponent(book.image)}`
      : ''
  const ogImage = `${host}/api/og?type=book&user=${encodeURIComponent(book.user?.name ?? 'kidoku user')}&title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}&category=${encodeURIComponent(book.category)}${coverImageParam}`
  const pageUrl = `${host}/books/${book.id}`

  // 構造化データ: Book(+公開メモがあればReview)
  const bookJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: book.author },
    url: pageUrl,
    ...(book.image && /^https?:\/\//.test(book.image)
      ? { image: book.image }
      : {}),
    ...(book.category ? { genre: book.category } : {}),
  }
  if (book.isPublicMemo && book.memo) {
    bookJsonLd.review = {
      '@type': 'Review',
      reviewBody: book.memo,
      ...(book.user?.name
        ? { author: { '@type': 'Person', name: book.user.name } }
        : {}),
      itemReviewed: { '@type': 'Book', name: book.title },
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <JsonLd data={bookJsonLd} />
      <NextSeo
        title={`${book.title} | kidoku`}
        description={`${book.author} / ${book.category} の読書メモ`}
        canonical={pageUrl}
        openGraph={{
          title: `${book.title} | kidoku`,
          description: `${book.author} / ${book.category} の読書メモ`,
          url: pageUrl,
          images: [{ url: ogImage, width: 1200, height: 630 }],
        }}
        twitter={{ cardType: 'summary_large_image' }}
      />
      <div className="mx-auto max-w-4xl py-8">
        {sheetUrl && (
          <nav
            aria-label="パンくずリスト"
            className="mb-4 px-4 text-sm text-gray-500"
          >
            <ol className="flex items-center">
              <li>
                <Link
                  href={sheetUrl}
                  className="hover:text-gray-700 hover:underline"
                >
                  {book.sheet}
                </Link>
              </li>
              <li className="flex items-center">
                <MdChevronRight className="mx-1" size={16} />
                <span className="truncate text-gray-800">{book.title}</span>
              </li>
            </ol>
          </nav>
        )}
        {editMode && isOwner ? (
          <BookDetailEditPage
            book={book}
            onClose={handleClose}
            onCancel={handleEditToggle}
            onSaved={handleSaved}
          />
        ) : (
          <BookDetailReadModal
            book={book}
            onClose={handleClose}
            onEdit={isOwner ? handleEditToggle : undefined}
            showComments
          />
        )}
      </div>
    </div>
  )
}
