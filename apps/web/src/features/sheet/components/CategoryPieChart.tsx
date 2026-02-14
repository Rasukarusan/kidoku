import { useMemo } from 'react'
import { Book } from '@/types/book'
import { BasePieChart, PieSlice } from './BasePieChart'

interface Props {
  sheet: string
  records: Book[]
  setShowData: (newData: Book[]) => void
  setFilter: (filter: string) => void
}

export function CategoryPieChart({
  sheet,
  records,
  setShowData,
  setFilter,
}: Props) {
  const data: PieSlice[] = useMemo(() => {
    const categories: Record<string, number> = {}
    records.forEach((record) => {
      const category = record.category
      if (category in categories) {
        categories[category] = categories[category] + 1
      } else {
        categories[category] = 1
      }
    })
    return Object.keys(categories).map((name) => {
      const value = categories[name]
      const percent = (value / records.length) * 100
      return { name, value, percent }
    })
  }, [records])

  const onSelect = (name: string) => {
    setFilter(name)
    setShowData(records.filter((record) => record.category === name))
  }

  const onDeselect = () => {
    setShowData(records)
    setFilter('')
  }

  return (
    <div style={{ width: '100%', height: '300px' }} key={sheet}>
      <BasePieChart
        data={data}
        outerRadius={100}
        onSelect={onSelect}
        onDeselect={onDeselect}
      />
    </div>
  )
}
