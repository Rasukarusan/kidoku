import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { makeStyles } from '@mui/styles'
import {
  Container,
  Grid,
  Tab,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Typography,
} from '@mui/material'
import { TabContext, TabList } from '@mui/lab'
import { H2 } from '@/components/Label/H2'
import { Record } from '../types'
import { BarGraph } from './'
import { getYears } from '../util'
import SmsIcon from '@mui/icons-material/Sms'

const TreemapGraph = dynamic(
  () => import('./TreemapGraph').then((mod) => mod.TreemapGraph),
  { ssr: false }
)

const useStyles = makeStyles({
  image: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
})

interface Props {
  data: Record[]
  year: string
}

export const SheetPage: React.FC<Props> = ({ data, year }) => {
  const classes = useStyles()
  const router = useRouter()
  const [currentData, setCurrentData] = useState<Record[]>([])
  const [tab, setTab] = useState(year)
  const [auth, setAuth] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLImageElement | null>(null)
  const [open, setOpen] = useState(false)
  const [book, setBook] = useState<Record>(null)

  useEffect(() => {
    setCurrentData(data)
  }, [data])

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((res) => {
        setAuth(res)
      })
  }, [])

  const setShowData = (newData: Record[]) => {
    setCurrentData(newData)
  }

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue)
    router.push(`/sheet/${newValue}`)
  }

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

  return (
    <Container fixed>
      <H2 title="読書シート" />
      <TabContext value={tab}>
        <Box
          sx={{ marginBottom: '16px', borderBottom: 1, borderColor: 'divider' }}
        >
          <TabList onChange={handleChange} aria-label="readgin records">
            {getYears()
              .reverse()
              .map((year) => (
                <Tab label={year} value={year} />
              ))}
          </TabList>
        </Box>
      </TabContext>
      <Box
        sx={{
          width: '100%',
          marginBottom: '100px',
        }}
      >
        <Grid container sx={{ paddingBottom: 3 }}>
          <Grid item xs={12} sm={6} md={6}>
            <BarGraph records={data} setShowData={setShowData} />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <TreemapGraph records={data} setShowData={setShowData} />
          </Grid>
        </Grid>
        <Grid container rowSpacing={1} columnSpacing={{ xs: 2, sm: 2, md: 3 }}>
          {currentData.map((book, i) => {
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
                  <img
                    className={classes.image}
                    src={book.image}
                    width={128}
                    height={186}
                    onMouseEnter={handleImageHover}
                    onMouseLeave={handleImageLeave}
                    data-book={JSON.stringify(book)}
                    onClick={onClickImage}
                  />
                  {book?.memo !== '[期待]\n\n[感想]' && book?.memo !== '' && (
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
      </Box>
      <Dialog onClose={() => setOpen(false)} open={open}>
        <DialogTitle>{book?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ marginRight: '0 auto' }}>
            <a
              href={encodeURI(`https://www.amazon.co.jp/s?k=${book?.title}`)}
              target="_blank"
            >
              amazon
            </a>
          </DialogContentText>
          <DialogContentText>{book?.author}</DialogContentText>
          <DialogContentText>{book?.category}</DialogContentText>
          {auth && <DialogContentText>{book?.memo}</DialogContentText>}
        </DialogContent>
      </Dialog>
    </Container>
  )
}
