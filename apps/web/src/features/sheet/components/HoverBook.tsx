import { motion } from 'framer-motion'
import { Book } from '@/types/book'
import { useIsBookOwner } from '@/hooks/useIsBookOwner'
import { MemoPreview } from './MemoPreview'

interface Props {
  book: Book
}

export const HoverBook: React.FC<Props> = ({ book }) => {
  const isMine = useIsBookOwner(book)

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* 下部グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* テキストコンテンツ */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-2 text-white"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <div className="line-clamp-2 text-xs font-bold leading-tight">
          {book.title}
        </div>
        <div className="mt-1 text-[10px] text-gray-300">{book.author}</div>

        {(isMine || book.is_public_memo) && book.memo && (
          <div className="mt-1 overflow-hidden">
            <motion.div
              className="inline-flex whitespace-nowrap text-[10px] text-gray-200"
              initial={{ x: 0 }}
              animate={{ x: '-50%' }}
              transition={{
                duration: Math.max(book.memo.length / 5, 3),
                repeat: Infinity,
                ease: 'linear',
                delay: 0.5,
              }}
            >
              <span className="pr-8">
                <MemoPreview memo={book.memo.replace(/\n/g, ' ')} />
              </span>
              <span className="pr-8">
                <MemoPreview memo={book.memo.replace(/\n/g, ' ')} />
              </span>
            </motion.div>
          </div>
        )}

        {!isMine && !book.is_public_memo && (
          <div className="mt-1 text-[10px] text-gray-400">非公開メモ</div>
        )}
      </motion.div>
    </motion.div>
  )
}
