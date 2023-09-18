import { Fragment } from 'react'
import { Record } from '../types'
import { Divider } from '@mui/material'
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
        <div className="w-2/3 mr-2">
          <textarea
            className="font-bold text-xl mb-2 overflow-hidden w-full mr-2 bg-slate-100 px-2 py-1"
            value={book.title}
            onChange={(e) => {
              setBook({ ...book, title: e.target.value })
            }}
            tabIndex={1}
          />
          <div className="flex items-center mb-2">
            <span className="mr-1">
              <PeopleAltIcon />
            </span>
            <textarea
              value={book.author}
              rows={1}
              className="pl-2 py-1 bg-slate-100 w-full"
              onChange={(e) => {
                setBook({ ...book, author: e.target.value })
              }}
              tabIndex={2}
            />
          </div>
          <div className="flex items-center mb-2">
            <span className="mr-1">
              <CategoryIcon />
            </span>
            <textarea
              value={book.category}
              rows={1}
              className="pl-2 py-1 bg-slate-100 w-full"
              onChange={(e) => {
                setBook({ ...book, category: e.target.value })
              }}
              tabIndex={3}
            />
          </div>
          <div className="flex items-center mb-2">
            <span className="mr-1">
              <InsertEmoticonIcon />
            </span>
            <textarea
              value={book.impression}
              rows={1}
              className="pl-2 py-1 bg-slate-100 w-full"
              onChange={(e) => {
                setBook({ ...book, impression: e.target.value })
              }}
              tabIndex={4}
            />
          </div>
        </div>
      </div>
      {session && (
        <>
          <Divider sx={{ margin: '15px 0px' }} />
          <textarea
            value={book.memo}
            className="w-full p-2 bg-slate-100 w-full"
            rows={12}
            cols={80}
            onChange={(e) => {
              setBook({ ...book, memo: e.target.value })
            }}
            tabIndex={5}
          />
        </>
      )}
      <div className="pt-4 border-t border-1 text-center">
        <button
          className="hover:bg-green-700 bg-green-600 px-4 py-1 font-bold text-white rounded-md"
          onClick={onClick}
          tabIndex={6}
        >
          保存
        </button>
      </div>
    </div>
  )
}
