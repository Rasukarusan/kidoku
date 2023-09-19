import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { Record } from '../types'

interface Props {
  book: Record
  onClick: (book: Record) => void
  onMouseLeave: (i: number) => void
}

export const HoverBook: React.FC<Props> = ({ book, onClick, onMouseLeave }) => {
  const { data: session } = useSession()
  const isMine = session?.user?.id === book.userId

  return (
    <motion.div
      className="absolute top-0 z-10 bg-white w-[350px] border-2 border-[#507C8F] rounded p-0"
      animate={{ scale: 1.2, color: '#263238' }}
      onMouseLeave={() => onMouseLeave(-1)}
      onClick={() => onClick(book)}
    >
      <div className="flex">
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
          <div className="font-bold text-sm">{book.title}</div>
          <div className="text-xs pt-1">{book.author}</div>
          {(isMine || book.is_public_memo) && (
            <div className="text-xs mt-2 h-[80px] line-clamp-5 ">
              {book.memo}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
