import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { AnimatePresence, motion } from 'framer-motion'
import { bookDeleteNoticeAtom } from '../hooks/useDeleteBook'

export const BookDeleteNotice = () => {
  const [notice, setNotice] = useAtom(bookDeleteNoticeAtom)
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 5000)
    return () => clearTimeout(timer)
  }, [notice, setNotice])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[2000] flex justify-center px-4">
      <AnimatePresence>
        {notice && (
          <motion.div
            key={notice.text}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            role={notice.error ? 'alert' : 'status'}
            className={`pointer-events-auto flex max-w-lg items-center gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${notice.error ? 'bg-red-700' : 'bg-green-700'}`}
          >
            <span aria-hidden="true">{notice.error ? '!' : '✓'}</span>
            <span>{notice.text}</span>
            <button aria-label="通知を閉じる" onClick={() => setNotice(null)}>
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
