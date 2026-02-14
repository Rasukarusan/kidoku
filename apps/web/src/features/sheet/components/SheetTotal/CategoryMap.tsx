import { useMemo } from 'react'
import { Category } from '../../types'
import { BasePieChart, PieSlice } from '../BasePieChart'

interface Props {
  categories: Category[]
}

export const CategoryMap: React.FC<Props> = ({ categories }) => {
  const data: PieSlice[] = useMemo(() => {
    return categories.map((c) => ({
      name: c.name,
      value: c.count,
      percent: c.percent,
    }))
  }, [categories])

  return <BasePieChart data={data} outerRadius={120} stroke="none" />
}
