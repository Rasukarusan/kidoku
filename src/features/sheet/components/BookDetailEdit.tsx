import { Fragment } from 'react'
import { Book } from '@/types/book'
import { Divider } from '@mui/material'
import { ToggleButton } from '@/components/button/ToggleButton'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import CategoryIcon from '@mui/icons-material/Category'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'
import { useSession } from 'next-auth/react'
import { Loading } from '@/components/icon/Loading'

interface Props {
  book: Book
  onClick: () => void
  setBook: (book: Book) => void
  loading: boolean
}

export const BookDetailEdit: React.FC<Props> = ({
  book,
  onClick,
  setBook,
  loading,
}) => {
  const { data: session } = useSession()
  const isMine = session?.user?.id === book.userId
  return (
    <>
      <div className="p-4 overflow-y-hidden">
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
              className="font-bold mb-2 overflow-hidden w-full mr-2 bg-slate-100 px-2 py-1 text-base sm:text-xl"
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
                className="pl-2 py-1 bg-slate-100 w-full text-sm sm:text-base"
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
                className="pl-2 py-1 bg-slate-100 w-full text-sm sm:text-base"
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
                className="pl-2 py-1 bg-slate-100 w-full text-sm sm:text-base"
                onChange={(e) => {
                  setBook({ ...book, impression: e.target.value })
                }}
                tabIndex={4}
              />
            </div>
          </div>
        </div>
        {isMine && (
          <>
            <Divider sx={{ margin: '15px 0px' }} />
            <textarea
              value={book.memo}
              className="w-full p-2 bg-slate-100 w-full mb-2 text-sm sm:text-base"
              rows={8}
              cols={80}
              onChange={(e) => {
                setBook({ ...book, memo: e.target.value })
              }}
              tabIndex={5}
            />
            <ToggleButton
              label="メモを公開する"
              checked={book.is_public_memo}
              onChange={() => {
                setBook({ ...book, is_public_memo: !book.is_public_memo })
              }}
            />
          </>
        )}
      </div>
      <div className="border-t border-1 text-center w-full">
        <button
          className="hover:bg-green-700 bg-green-600 px-4 py-1 font-bold text-white w-full h-12 flex items-center justify-center"
          onClick={onClick}
          tabIndex={6}
        >
          {loading && (
            <Loading className="w-[18px] h-[18px] border-[3px] mr-2 border-white" />
          )}
          <span>保存する</span>
        </button>
      </div>
    </>
  )
}
