import { useState } from 'react'
import { NextSeo } from 'next-seo'
import { Container } from '@/components/layout/Container'
import { SearchResult } from '@/types/search'
import { MAX_DEMO_BOOKS } from '../utils'
import { BookSearch } from './BookSearch'
import { DiagnosisResult } from './DiagnosisResult'
import { FaCircleNotch, FaTimes } from 'react-icons/fa'

interface DiagnosisResultData {
  character_summary: string
  comment: string
}

export const DiagnosisPage: React.FC = () => {
  const host = process.env.NEXT_PUBLIC_HOST || 'https://kidoku.net'
  const [books, setBooks] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DiagnosisResultData | null>(null)
  const [error, setError] = useState('')

  const addBook = (book: SearchResult) => {
    if (books.length >= MAX_DEMO_BOOKS) return
    if (books.some((b) => b.id === book.id)) return
    setBooks([...books, book])
  }

  const removeBook = (id: string | number) => {
    setBooks(books.filter((b) => b.id !== id))
  }

  const diagnose = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          books: books.map((b) => ({
            title: b.title,
            author: b.author,
            category: b.category,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.result) {
        setError('診断に失敗しました。少し時間をおいて再度お試しください。')
        return
      }
      setResult({
        character_summary: data.character_summary,
        comment: data.comment ?? '',
      })
    } catch {
      setError('通信中にエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setBooks([])
    setError('')
  }

  const ogImage = `${host}/api/og?type=ai&user=${encodeURIComponent(
    'あなた'
  )}&summary=${encodeURIComponent(
    '読んだ本でわかる読書性格'
  )}&sub=${encodeURIComponent('本を3冊選ぶだけ・無料AI診断')}`

  return (
    <>
      <NextSeo
        title="読書性格診断 | kidoku"
        description="最近読んだ本を3冊選ぶだけ。AIがあなたの“読書性格”を無料で診断します。ログイン不要。"
        openGraph={{
          title: '読んだ本でわかる、あなたの読書性格診断',
          description:
            '最近読んだ本を3冊選ぶだけ。AIがあなたの“読書性格”を無料で診断します。',
          images: [{ url: ogImage, width: 1200, height: 630 }],
        }}
      />
      <Container className="px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
              読んだ本でわかる
              <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                読書性格診断
              </span>
            </h1>
            <p className="mt-3 text-sm text-gray-600 sm:text-base">
              最近読んだ本を3冊選ぶだけ。AIがあなたの“読書性格”を無料で診断します。
            </p>
          </div>

          <div className="mt-8">
            {result ? (
              <DiagnosisResult
                characterSummary={result.character_summary}
                comment={result.comment}
                books={books}
                onRetry={reset}
              />
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <FaCircleNotch
                  size={32}
                  className="animate-spin text-purple-400"
                />
                <p className="mt-4 animate-pulse text-sm">
                  AIがあなたの読書性格を診断中...
                </p>
              </div>
            ) : (
              <>
                {/* 選択済みの本 */}
                <div className="mb-4">
                  <p className="mb-2 text-sm font-bold text-gray-700">
                    選んだ本（{books.length}/{MAX_DEMO_BOOKS}）
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {books.length === 0 && (
                      <p className="text-sm text-gray-400">
                        下の検索から本を3冊選んでください
                      </p>
                    )}
                    {books.map((book) => (
                      <span
                        key={book.id}
                        className="flex items-center gap-1 rounded-full bg-purple-100 py-1 pl-3 pr-2 text-sm text-purple-700"
                      >
                        {book.title}
                        <button
                          onClick={() => removeBook(book.id)}
                          className="ml-1 rounded-full p-0.5 hover:bg-purple-200"
                          aria-label="削除"
                        >
                          <FaTimes size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {books.length < MAX_DEMO_BOOKS && (
                  <BookSearch
                    onSelect={addBook}
                    selectedIds={books.map((b) => b.id)}
                  />
                )}

                {error && (
                  <p className="mt-4 text-center text-sm text-red-500">
                    {error}
                  </p>
                )}

                <button
                  onClick={diagnose}
                  disabled={books.length < MAX_DEMO_BOOKS}
                  className="mt-6 w-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-base font-bold text-white shadow-md transition-transform enabled:hover:scale-105 enabled:hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {books.length < MAX_DEMO_BOOKS
                    ? `あと${MAX_DEMO_BOOKS - books.length}冊選んでください`
                    : '読書性格を診断する'}
                </button>
              </>
            )}
          </div>
        </div>
      </Container>
    </>
  )
}
