import { Fragment, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { makeStyles } from '@mui/styles'
import SmsIcon from '@mui/icons-material/Sms'
import { isLoginAtom } from '@/store/isLogin'
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Divider,
} from '@mui/material'
import { Record } from '../types'
import { Memo } from './Memo'
import PeopleAltIcon from '@mui/icons-material/PeopleAlt'
import CategoryIcon from '@mui/icons-material/Category'
import { HoverBook } from './HoverBook'

const useStyles = makeStyles({
  image: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

interface Props {
  books: Record[]
}
export const Books: React.FC<Props> = ({ books }) => {
  const initialHovers = Array(books.length).fill(false)
  const classes = useStyles()
  const isLogin = useRecoilValue(isLoginAtom)
  const [open, setOpen] = useState(false)
  const [selectBook, setSelectBook] = useState<Record>(null)
  const [hovers, setHovers] = useState(initialHovers)

  const onClickImage = (book: Record) => {
    setSelectBook(book)
    setOpen(true)
  }

  const onMouseEnter = (i: number) => {
    const newHovers = [...initialHovers]
    newHovers[i] = true
    setHovers(newHovers)
  }

  const onMouseLeave = (i: number) => {
    // hoverするとズーム用のコンポーネントが表示され、そちらにMouseEnterするためMouseLeaveしてしまう
    // そうなるとEnterとLeaveが無限ループしてしまうため、Leaveする際に現在のhover[i]=trueになっているインデックスと、
    // Leaveする際のインデックスが同じの場合はLeaveしないようにreturnするようにしている。
    const current = hovers.findIndex((v) => v)
    if (current === i) return
    const newHovers = [...initialHovers]
    newHovers[i] = false
    setHovers(newHovers)
  }

  return (
    <>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 2, sm: 2, md: 3 }}>
        {books.map((book, i) => {
          return (
            <Grid key={book.title + i} item xs={4} sm={3} md={2}>
              <div className={`book ${hovers[i] && 'book-hover'}`}>
                <img
                  className={classes.image}
                  src={book.image === '-' ? '/no-image.png' : book.image}
                  width={128}
                  height={186}
                  onClick={() => onClickImage(book)}
                  onMouseEnter={() => onMouseEnter(i)}
                  onMouseLeave={() => onMouseLeave(i)}
                />
                {isLogin &&
                  book?.memo !== '[期待]\n\n[感想]' &&
                  book?.memo !== '' && (
                    <p
                      style={{
                        position: 'absolute',
                        top: '-30px',
                        right: '25px',
                      }}
                    >
                      <SmsIcon />
                    </p>
                  )}
                {hovers[i] && (
                  <HoverBook book={book} onMouseLeave={onMouseLeave} />
                )}
              </div>
            </Grid>
          )
        })}
        <style jsx>{`
          .book {
            position: relative;
            background: white;
            // transition: 0.5s;
          }
          .book:hover {
            // transform: scale(1.3);
          }
        `}</style>
      </Grid>

      <Dialog onClose={() => setOpen(false)} open={false}>
        <DialogTitle>
          <a
            href={encodeURI(
              `https://www.amazon.co.jp/s?k=${selectBook?.title}`
            )}
            target="_blank"
            rel="noreferrer"
          >
            {selectBook?.title}
          </a>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
          >
            <PeopleAltIcon sx={{ marginRight: '5px' }} />
            {selectBook?.author}
          </DialogContentText>
          <DialogContentText
            sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}
          >
            <CategoryIcon sx={{ marginRight: '5px' }} />
            {selectBook?.category}
          </DialogContentText>
          {isLogin && (
            <>
              <Divider sx={{ margin: '15px 0px' }} />
              <DialogContentText>
                <Memo memo={selectBook?.memo} />
              </DialogContentText>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
