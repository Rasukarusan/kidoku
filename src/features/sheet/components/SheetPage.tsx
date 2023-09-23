import useSWR from 'swr'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  Container,
  Grid,
  Box,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import { Record } from '../types'
import { BarGraph } from './BarGraph'
import { Tabs } from './Tabs'
import { Books } from './Books'
import { BookRows } from './BookRows'
import GridViewIcon from '@mui/icons-material/GridView'
import TableRowsIcon from '@mui/icons-material/TableRows'
import { fetcher } from '@/libs/swr'
import { useSession } from 'next-auth/react'

const TreemapGraph = dynamic(
  () => import('./TreemapGraph').then((mod) => mod.TreemapGraph),
  { ssr: false }
)

interface Props {
  data: Record[]
  year: string
  sheets: string[]
}

export const SheetPage: React.FC<Props> = ({ data, year, sheets }) => {
  const { data: session } = useSession()
  // アクセスしているページが自分のページの場合、非公開メモも表示したいためクライアント側で改めて本データを取得する
  const { data: res } = useSWR(`/api/books/${year}`, fetcher, {
    fallbackData: { result: true, books: data },
  })
  const [currentData, setCurrentData] = useState<Record[]>(data)
  const [open, setOpen] = useState(false)
  // 一覧表示か書影表示か
  const [mode, setMode] = useState<'row' | 'grid'>('grid')

  useEffect(() => {
    const isMine =
      data.length > 0 && session && session.user.id === data[0].userId
    if (isMine) {
      setCurrentData(res.books)
    }
  }, [res, session])

  const setShowData = (newData: Record[]) => {
    setCurrentData(newData)
  }

  const handleChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'row' | 'grid'
  ) => {
    setMode(newMode)
  }

  return (
    <Container fixed sx={{ marginBottom: '32px' }}>
      <Box
        sx={{ marginBottom: '16px', borderBottom: 1, borderColor: 'divider' }}
      >
        <Tabs sheets={sheets} value={year} />
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
      <Box
        sx={{
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        <ToggleButtonGroup
          color="standard"
          value={mode}
          exclusive
          onChange={handleChange}
          aria-label="Platform"
        >
          <ToggleButton value="grid">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="row">
            <TableRowsIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {mode === 'grid' ? (
        <Books books={currentData} />
      ) : (
        <BookRows books={currentData} />
      )}
    </Container>
  )
}
