import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Book } from '@/types/book'
import { MemoPreview } from './MemoPreview'

interface Props {
  book: Book
  onClick: (book: Book, event?: React.MouseEvent) => void
  onMouseLeave: (i: number) => void
}

export const HoverBook: React.FC<Props> = ({ book, onClick, onMouseLeave }) => {
  const { data: session } = useSession()
  const isMine = session?.user?.id === book.userId

  return (
    <motion.div
      className="absolute inset-0 z-10 cursor-pointer overflow-hidden rounded"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      onMouseLeave={() => onMouseLeave(-1)}
      onClick={(e) => onClick(book, e)}
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
        <div className="text-xs font-bold leading-tight line-clamp-2">
          {book.title}
        </div>
        <div className="mt-1 text-[10px] text-gray-300">{book.author}</div>

        {(isMine || book.is_public_memo) && book.memo && (
          <div className="mt-1 text-[10px] leading-tight text-gray-200 line-clamp-2">
            <MemoPreview memo={book.memo} />
          </div>
        )}

        {!isMine && !book.is_public_memo && (
          <div className="mt-1 text-[10px] text-gray-400">非公開メモ</div>
        )}
      </motion.div>
    </motion.div>
  )
}
