import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { motion, useAnimation } from 'framer-motion'
import { makeStyles } from '@mui/styles'
import {
  Container,
  Grid,
  Tab,
  Box,
  Fade,
  Popper,
  duration,
} from '@mui/material'
import { TabContext, TabList } from '@mui/lab'
import { H2 } from '@/components/Label/H2'
import { ReadingRecord, Record } from '../types'
import { createRef, useRef } from 'react'

const useStyles = makeStyles({
  image: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  box: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'blue',
  },
})

interface Props {
  data: ReadingRecord
  year: string
}

export const SheetPage: React.FC<Props> = ({ data, year }) => {
  const classes = useStyles()
  const router = useRouter()
  const [tab, setTab] = useState(year)
  const [hoverBook, setHoverBook] = useState<Record>(null)

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue)
    router.push(`/sheet/${newValue}`)
  }

  const handleImageHover = (event) => {
    setHoverBook(JSON.parse(event.currentTarget.dataset.book))
  }

  const handleImageLeave = (event) => {}

  return (
    <Container fixed>
      <H2 title="読書シート" />
      <TabContext value={tab}>
        <Box
          sx={{ marginBottom: '16px', borderBottom: 1, borderColor: 'divider' }}
        >
          <TabList onChange={handleChange} aria-label="readgin records">
            <Tab label="2022" value="2022" />
            <Tab label="2021" value="2021" />
            <Tab label="2020" value="2020" />
            <Tab label="2019" value="2019" />
            <Tab label="2018" value="2018" />
          </TabList>
        </Box>
      </TabContext>
      <Box
        sx={{
          width: '100%',
        }}
      >
        <Grid container rowSpacing={1} columnSpacing={{ xs: 2, sm: 2, md: 3 }}>
          {data.map((book, i) => {
            return (
              <Grid key={book.title + i} item xs={4} sm={3} md={2}>
                <motion.img
                  whileHover={{
                    scale: 1.2,
                  }}
                  className={classes.image}
                  src={book.image}
                  width={128}
                  height={186}
                  onMouseEnter={handleImageHover}
                  onMouseLeave={handleImageLeave}
                  data-book={JSON.stringify(book)}
                />
              </Grid>
            )
          })}
        </Grid>
      </Box>
    </Container>
  )
}
