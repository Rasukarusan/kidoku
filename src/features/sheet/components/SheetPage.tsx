import { useState } from 'react'
import { useRouter } from 'next/router'
import { Container, Tab, Box } from '@mui/material'
import { TabContext, TabList } from '@mui/lab'
import { H2 } from '@/components/Label/H2'
import { ReadingRecord } from '../types'

interface Props {
  data: ReadingRecord
  year: string
}
export const SheetPage: React.FC<Props> = ({ data, year }) => {
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="readgin records">
            <Tab label="2022" value="2022" />
            <Tab label="2021" value="2021" />
            <Tab label="2020" value="2020" />
            <Tab label="2019" value="2019" />
            <Tab label="2018" value="2018" />
          </TabList>
        </Box>
      </TabContext>
      {Object.keys(data).map((key) => (
        <div key={key}>
          <div>
            <b>{key}</b>
          </div>
          {data[key].map((book) => {
            return (
              <div key={book.title}>
                {book.title},{book.author}
              </div>
            )
          })}
        </div>
      ))}
    </Container>
  )
}
