import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Book } from '@/types/book'

interface Props {
  book: Book
  onClick: (book: Book) => void
  onMouseLeave: (i: number) => void
}

export const HoverBook: React.FC<Props> = ({ book, onClick, onMouseLeave }) => {
  const { data: session } = useSession()
  const isMine = session?.user?.id === book.userId

  return (
    <motion.div
      className="absolute top-0 z-10 w-[350px] max-w-[350px] overflow-x-hidden rounded border-2 border-[#507C8F] bg-white p-0"
      animate={{ scale: 1.2, color: '#263238' }}
      onMouseLeave={() => onMouseLeave(-1)}
      onClick={() => onClick(book)}
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
            <div className="h-[80px] text-xs line-clamp-5">{book.memo}</div>
          )}
          {!isMine && !book.is_public_memo && (
            <div className="relative">
              <div className="absolute h-20 w-[190px] bg-gray-200 blur-sm"></div>
              <div className="flex h-20 items-center justify-center rounded-md">
                <div>
                  <div className="mb-2 flex items-center justify-center blur-none">
                    <div className="text-center text-sm font-bold blur-none">
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
