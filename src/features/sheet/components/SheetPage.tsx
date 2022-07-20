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

let prePositionsX = []
let prePositionsY = []

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

  const handleImageLeave = () => {}

  useEffect(() => {
    setInterval(() => {
      getPositions()
    }, 100)
  }, [])

  const getPositions = () => {
    const imgs = document.getElementsByTagName('img')
    const positionsX = []
    const positionsY = []
    for (var i = 0; i < imgs.length; i++) {
      positionsX[i] = imgs[i].getBoundingClientRect().x
      positionsY[i] = imgs[i].getBoundingClientRect().y
    }

    let boomX = false
    let boomY = false
    // 現在動いている要素のインデックスを取得
    if (prePositionsX.length !== 0) {
      // 前回と位置が違う = 現在動いている
      const draggingImgsX = positionsX
        .map((v, i) => {
          if (!prePositionsX.includes(v)) return i
        })
        .filter((v) => v >= 0)
      draggingImgsX.forEach((i) => {
        const x = positionsX[i]
        delete positionsX[i]
        boomX = positionsX
          .filter((v) => v)
          .some((v) => v - 30 <= x && x <= v + 30)
      })
    }
    if (prePositionsY.length !== 0) {
      const draggingImgsY = positionsY
        .map((v, i) => {
          if (!prePositionsY.includes(v)) return i
        })
        .filter((v) => v >= 0)
      draggingImgsY.forEach((i) => {
        const y = positionsY[i]
        delete positionsY[i]
        boomY = positionsY
          .filter((v) => v)
          .some((v) => v - 30 <= y && y <= v + 30)
        const isBoom = boomX && boomY
        if (isBoom) {
          const imgs = document.getElementsByTagName('img')
          imgs[i].style.opacity = '0.1'
        } else {
          imgs[i].style.opacity = '1'
        }
      })
    }
    prePositionsX = positionsX
    prePositionsY = positionsY
  }

  const onDrag = (event, info, index) => {
    const currentX = info.point.x
  }

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
                  whileHover={
                    {
                      // rotateX: '120deg',
                      // rotateY: '90deg',
                      // rotateZ: '190deg',
                      // scale: 2.0,
                      // translateX: '40%',
                      // transition: { repeat: 0 },
                    }
                  }
                  drag
                  onDrag={(event, info) => onDrag(event, info, i)}
                  dragConstraints={{
                    top: -1000,
                    left: -1000,
                    right: 1000,
                    bottom: 1000,
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
