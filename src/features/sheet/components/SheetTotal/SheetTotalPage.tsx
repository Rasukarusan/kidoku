import { useState } from 'react'
import { Container, Box } from '@mui/material'
import { useRouter } from 'next/router'
import { Tabs, Title } from '../'
import { Category, Record, Year } from '../../types'
import { CategoryMap, Value } from './'
import { YearsGraph } from './YearsGraph'

interface Props {
  res: Record[]
  categories: Category[]
  years: Year[]
}
export const SheetTotalPage: React.FC<Props> = ({ res, categories, years }) => {
  const [tab, setTab] = useState('total')
  const router = useRouter()
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue)
    router.push(`/sheet/${newValue}`)
  }

  return (
    <Container fixed>
      <Title />
      <Box
        sx={{ marginBottom: '16px', borderBottom: 1, borderColor: 'divider' }}
      >
        <Tabs value="total" />
      </Box>
      <Box sx={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2>累計読書数</h2>
        <Value value={res.length} unit="冊" />
        <div style={{ width: '85%', height: '300px', margin: '0 auto' }}>
          <CategoryMap categories={categories} />
        </div>
      </Box>

      <Box sx={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2>年間平均読書数</h2>
        <Value value={Math.ceil(res.length / 7)} unit="冊" />
        <div style={{ width: '85%', height: '300px', margin: '0 auto' }}>
          <YearsGraph years={years} />
        </div>
      </Box>
    </Container>
  )
}
