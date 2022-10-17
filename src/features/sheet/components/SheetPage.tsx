import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Container, Grid, Box } from '@mui/material'
import { Record } from '../types'
import { BarGraph, Tabs } from './'
import { Books } from './Books'

const TreemapGraph = dynamic(
  () => import('./TreemapGraph').then((mod) => mod.TreemapGraph),
  { ssr: false }
)

interface Props {
  data: Record[]
  year: string
}

export const SheetPage: React.FC<Props> = ({ data, year }) => {
  const [currentData, setCurrentData] = useState<Record[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setCurrentData(data)
  }, [data])

  const setShowData = (newData: Record[]) => {
    setCurrentData(newData)
  }

  return (
    <Container fixed>
      <Box
        sx={{ marginBottom: '16px', borderBottom: 1, borderColor: 'divider' }}
      >
        <Tabs value={year} />
      </Box>
      <Box
        sx={{
          width: '100%',
          marginBottom: '50px',
        }}
      >
        <Grid container>
          <Grid item xs={12} sm={6} md={6}>
            <BarGraph records={data} setShowData={setShowData} />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <TreemapGraph records={data} setShowData={setShowData} />
          </Grid>
        </Grid>
      </Box>
      <Books books={currentData} />
    </Container>
  )
}
