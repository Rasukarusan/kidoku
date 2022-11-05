import { useRecoilValue } from 'recoil'
import { isLoginAtom } from '@/store/isLogin'
import { Record } from '../types'
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Divider,
} from '@mui/material'
import { Memo } from './Memo'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import CategoryIcon from '@mui/icons-material/Category'
import { HoverBook } from './HoverBook'

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
      <DialogTitle>
        <a
          href={encodeURI(`https://www.amazon.co.jp/s?k=${book.title}`)}
          target="_blank"
          rel="noreferrer"
        >
          {book.title}
        </a>
      </DialogTitle>
      <DialogContent>
        <DialogContentText
          sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
        >
          <PeopleAltIcon sx={{ marginRight: '5px' }} />
          {book.author}
        </DialogContentText>
        <DialogContentText
          sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
        >
          <CategoryIcon sx={{ marginRight: '5px' }} />
          {book.category}
        </DialogContentText>
        {isLogin && (
          <>
            <Divider sx={{ margin: '15px 0px' }} />
            <Memo memo={book.memo} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
