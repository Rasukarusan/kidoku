import { useState } from 'react'
import { useRouter } from 'next/router'
import { makeStyles } from '@mui/styles'
import { Container, Tab, Box } from '@mui/material'
import { TabContext, TabList } from '@mui/lab'
import { H2 } from '@/components/Label/H2'
import { ReadingRecord } from '../types'
import { Card } from './Card'

const useStyles = makeStyles({
  month: {
    fontWeight: 700,
    background: 'rgba(37, 50, 56, 0.1)',
  },
})

interface Props {
  data: ReadingRecord
  year: string
}

export const SheetPage: React.FC<Props> = ({ data, year }) => {
  const classes = useStyles()
  const router = useRouter()
  const [value, setValue] = useState(year)

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
    router.push(`/sheet/${newValue}`)
  }
  return (
    <Container fixed>
      <H2 title="読書シート" />
      <TabContext value={value}>
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
          maringTop: 5,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-start',
        }}
      >
        {data.map((book, i) => {
          // 1月 1月 1月 ...のように同じ月を連続して表示させたくないための制御
          let showMonth = i === 0 ? true : data[i - 1].month !== data[i].month
          return (
            <div key={i + book.title}>
              <div className={classes.month}>
                {showMonth ? book.month : '　'}
              </div>
              <Card record={book} />
            </div>
          )
        })}
      </Box>
    </Container>
  )
}
