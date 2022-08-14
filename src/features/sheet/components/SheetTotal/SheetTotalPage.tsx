import { useState } from 'react'
import { Container } from '@mui/material'
import { useRouter } from 'next/router'
import { Tabs, Title as PageTitle } from '../'
import { Category, Record, Year } from '../../types'
import { CategoryMap, Title, Value, Rankings } from './'
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
      <PageTitle />
      <div
        style={{
          marginBottom: '16px',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tabs value="total" />
      </div>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title text="累計読書数" />
        <Value value={res.length} unit="冊" />
        <div style={{ width: '85%', height: '300px', margin: '0 auto' }}>
          <CategoryMap categories={categories} />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title text="年間平均読書数" />
        <Value value={Math.ceil(res.length / 7)} unit="冊" />
        <div style={{ width: '85%', height: '300px', margin: '0 auto' }}>
          <YearsGraph years={years} />
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title text="年間ベスト書籍" />
        <Rankings />
      </div>
    </Container>
  )
}
