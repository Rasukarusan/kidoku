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
      className="absolute top-0 z-10 w-[350px] max-w-[350px] overflow-x-hidden rounded border-2 border-[#507C8F] bg-white p-0"
      initial={{ scale: 0.83 }}
      animate={{ scale: 1 }}
      onMouseLeave={() => onMouseLeave(-1)}
      onClick={(e) => onClick(book, e)}
    >
      <div className="flex w-full">
        <div className="min-w-[128px]">
          <img
            className="cursor-pointer drop-shadow-lg"
            src={book.image}
            width={128}
            height={186}
            alt=""
          />
        </div>
        <div className="p-2">
          <div className="text-sm font-bold">{book.title}</div>
          <div className="mb-2 pt-1 text-xs">{book.author}</div>
          {(isMine || book.is_public_memo) && (
            <div className="line-clamp-5 h-[80px] text-xs">
              <MemoPreview memo={book.memo} />
            </div>
          )}
          {!isMine && !book.is_public_memo && (
            <div className="relative">
              <div className="absolute h-20 w-[190px] bg-gray-200 blur-sm"></div>
              <div className="flex h-20 items-center justify-center rounded-md">
                <div>
                  <div className="mb-2 flex items-center justify-center blur-none">
                    <div className="z-10 text-center text-sm font-bold blur-none">
                      非公開のメモです
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
