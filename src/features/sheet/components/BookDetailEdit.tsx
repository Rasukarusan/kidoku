import { Record } from '../types'
import { Divider } from '@mui/material'
import { Memo } from './Memo'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import CategoryIcon from '@mui/icons-material/Category'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import { useSession } from 'next-auth/react'

interface Props {
  book: Record
  onClick: () => void
  setBook: (book: Record) => void
}

export const BookDetailEdit: React.FC<Props> = ({ book, onClick, setBook }) => {
  const { data: session } = useSession()
  return (
    <div className="p-4">
      <div className="flex items-start">
        <div className="w-1/3 mr-4">
          <img
            className="mx-auto my-0 drop-shadow-lg"
            src={book.image}
            alt={book.title}
          />
        </div>
        <div className="w-[50%] mr-2">
          <textarea
            className="font-bold text-xl mb-2 overflow-hidden w-full mr-2"
            value={book.title}
            onChange={(e) => {
              setBook({ ...book, title: e.target.value })
            }}
          />
          <div className="flex items-center mb-2">
            <span className="mr-1">
              <PeopleAltIcon />
            </span>
            {book.author}
          </div>
          <div className="flex items-center mb-2">
            <span className="mr-1">
              <CategoryIcon />
            </span>
            {book.category}
          </div>
          <div className="flex items-center mb-2">
            <span className="mr-1">
              <InsertEmoticonIcon />
            </span>
            {book.impression}
          </div>
        </div>
        <button
          className="bg-teal-700 px-4 py-1 font-bold text-white rounded-md"
          onClick={onClick}
        >
          保存
        </button>
      </div>
      {session && (
        <>
          <Divider sx={{ margin: '15px 0px' }} />
          <Memo memo={book.memo} />
        </>
      )}
    </div>
  )
}
