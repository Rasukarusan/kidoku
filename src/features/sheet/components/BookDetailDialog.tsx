import { useRecoilValue } from 'recoil'
import { isLoginAtom } from '@/store/isLogin'
import { Record } from '../types'
import { Dialog, Divider } from '@mui/material'
import { Memo } from './Memo'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import CategoryIcon from '@mui/icons-material/Category'
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon'

interface Props {
  book?: Record
  open: boolean
  onClose: () => void
}

export const BookDetailDialog: React.FC<Props> = ({ book, open, onClose }) => {
  const isLogin = useRecoilValue(isLoginAtom)
  if (!book) return null
  return (
    <Dialog onClose={onClose} open={open}>
      <div className="p-4">
        <div className="flex">
          <div className="w-1/3 mr-4">
            <a
              href={encodeURI(`https://www.amazon.co.jp/s?k=${book.title}`)}
              target="_blank"
              rel="noreferrer"
            >
              <img
                className="mx-auto my-0 drop-shadow-lg"
                src={book.image}
                alt={book.title}
              />
            </a>
          </div>
          <div>
            <div className="font-bold text-xl mb-2">
              <a
                href={encodeURI(`https://www.amazon.co.jp/s?k=${book.title}`)}
                target="_blank"
                rel="noreferrer"
              >
                {book.title}
              </a>
            </div>
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
        </div>
        {isLogin && (
          <>
            <Divider sx={{ margin: '15px 0px' }} />
            <Memo memo={book.memo} />
          </>
        )}
      </div>
    </Dialog>
  )
}
