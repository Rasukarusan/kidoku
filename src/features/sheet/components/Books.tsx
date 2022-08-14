import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { makeStyles } from '@mui/styles'
import Image from 'next/image'
import {
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from '@mui/material'
import { Record } from '../types'
import SmsIcon from '@mui/icons-material/Sms'

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
  const [auth, setAuth] = useState(false)
  const [currentData, setCurrentData] = useState<Record[]>([])
  const [anchorEl, setAnchorEl] = useState<HTMLImageElement | null>(null)
  const [open, setOpen] = useState(false)
  const [book, setBook] = useState<Record>(null)

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((res) => {
        setAuth(res)
      })
  }, [])

  const handleImageHover = (event) => {
    const book = event.currentTarget.dataset.book
    setAnchorEl(event.currentTarget)
  }

  const handleImageLeave = (event) => {
    setAnchorEl(null)
  }

  const onClickImage = (event) => {
    setBook(JSON.parse(event.currentTarget.dataset.book))
    setOpen(true)
  }

  const getDataBook = (book: Record): string => {
    if (!auth) {
      delete book.memo
    }
    return JSON.stringify(book)
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
                  onMouseEnter={handleImageHover}
                  onMouseLeave={handleImageLeave}
                  data-book={getDataBook(book)}
                  onClick={onClickImage}
                />
                {auth &&
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
        <DialogTitle>{book?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ marginRight: '0 auto' }}>
            <a
              href={encodeURI(`https://www.amazon.co.jp/s?k=${book?.title}`)}
              target="_blank"
              rel="noreferrer"
            >
              amazon
            </a>
          </DialogContentText>
          <DialogContentText>{book?.author}</DialogContentText>
          <DialogContentText>{book?.category}</DialogContentText>
          {auth && <DialogContentText>{book?.memo}</DialogContentText>}
        </DialogContent>
      </Dialog>
    </>
  )
}
