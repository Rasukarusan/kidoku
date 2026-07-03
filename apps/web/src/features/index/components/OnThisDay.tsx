import { useEffect, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { AiOutlineClose } from 'react-icons/ai'
import { useCachedSession } from '@/hooks/useCachedSession'

interface OnThisDayBook {
  id: number
  title: string
  author: string
  image: string
  yearsAgo: number
}

const STORAGE_KEY = 'kidoku:on-this-day-shown'

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('failed')
    return res.json()
  })

function todayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

// 「◯年前の今日」読み終えた本をふわっとモーダルで見せる（本人専用・1日1回だけ）
export const OnThisDay: React.FC = () => {
  const { status, session } = useCachedSession()
  const [open, setOpen] = useState(false)
  const [alreadyShown, setAlreadyShown] = useState(true)

  // その日すでに表示済みかどうかをマウント時に判定する
  useEffect(() => {
    try {
      setAlreadyShown(localStorage.getItem(STORAGE_KEY) === todayString())
    } catch {
      // localStorage が使えない環境では表示しない
    }
  }, [])

  const { data } = useSWR<{ books: OnThisDayBook[] }>(
    !alreadyShown && status === 'authenticated' && session
      ? '/api/me/on-this-day'
      : null,
    fetcher
  )

  // 該当する本があれば開き、その時点で「今日は表示済み」にする
  useEffect(() => {
    if (alreadyShown || !data || data.books.length === 0) return
    setOpen(true)
    try {
      localStorage.setItem(STORAGE_KEY, todayString())
    } catch {
      // localStorage が使えない環境では無視
    }
  }, [alreadyShown, data])

  const books = data?.books ?? []

  return (
    <AnimatePresence>
      {open && books.length > 0 && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="あの日の一冊"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">あの日の一冊</h2>
              <button
                className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                onClick={() => setOpen(false)}
                aria-label="閉じる"
              >
                <AiOutlineClose size={18} />
              </button>
            </div>
            <div className="space-y-4">
              {books.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex items-center gap-4 rounded-lg p-2 transition hover:bg-gray-50"
                  onClick={() => setOpen(false)}
                >
                  <img
                    className="h-24 w-16 min-w-16 rounded object-cover shadow-md"
                    src={book.image}
                    alt={book.title}
                  />
                  <div>
                    <div className="text-xs font-bold text-teal-700">
                      {book.yearsAgo}年前の今日、読み終えました
                    </div>
                    <div className="mt-1 text-sm font-bold text-gray-800">
                      {book.title}
                    </div>
                    <div className="text-xs text-gray-500">{book.author}</div>
                  </div>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-center text-[11px] text-gray-400">
              あなただけに表示されています
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
