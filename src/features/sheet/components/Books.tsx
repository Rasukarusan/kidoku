import { Fragment, useState } from 'react'
import { useRecoilValue } from 'recoil'
import { motion } from 'framer-motion'
import { makeStyles } from '@mui/styles'
import Image from 'next/image'
import SmsIcon from '@mui/icons-material/Sms'
import { isLoginAtom } from '@/store/isLogin'
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from '@mui/material'
import { Record } from '../types'
import { Memo } from './Memo'

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
  const classes = useStyles()
  const isLogin = useRecoilValue(isLoginAtom)
  const [open, setOpen] = useState(false)
  const [selectBook, setSelectBook] = useState<Record>(null)

  const onClickImage = (book: Record) => {
    setSelectBook(book)
    setOpen(true)
  }

  return (
    <>
      <Grid container rowSpacing={1} columnSpacing={{ xs: 2, sm: 2, md: 3 }}>
        {books.map((book, i) => {
          return (
            <Grid key={book.title + i} item xs={4} sm={3} md={2}>
              <motion.div
                style={{ position: 'relative' }}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: {
                    duration: 1,
                  },
                }}
                whileHover={{
                  scale: 1.2,
                }}
              >
                <Image
                  className={classes.image}
                  src={book.image === '-' ? '/no-image.png' : book.image}
                  width={128}
                  height={186}
                  onClick={() => onClickImage(book)}
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
              </motion.div>
            </Grid>
          )
        })}
      </Grid>

      <Dialog onClose={() => setOpen(false)} open={open}>
        <DialogTitle>{selectBook?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ marginRight: '0 auto' }}>
            <a
              href={encodeURI(
                `https://www.amazon.co.jp/s?k=${selectBook?.title}`
              )}
              target="_blank"
              rel="noreferrer"
            >
              amazon
            </a>
          </DialogContentText>
          <DialogContentText>{selectBook?.author}</DialogContentText>
          <DialogContentText>{selectBook?.category}</DialogContentText>
          {isLogin && (
            <DialogContentText>
              <Memo memo={selectBook?.memo} />
            </DialogContentText>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
