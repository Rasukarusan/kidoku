import { useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Book } from '@/types/book'

interface Props {
  sheet: string
  records: Book[]
  setShowData: (newData: Book[]) => void
  setFilter: (filter: string) => void
}

interface PieData {
  name: string
  value: number
  percent: number
}

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#0088FE',
  '#a4de6c',
  '#d0ed57',
  '#ffc0cb',
  '#dda0dd',
]

export function CategoryPieChart({
  sheet,
  records,
  setShowData,
  setFilter,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const data = useMemo(() => {
    const categories: Record<string, number> = {}
    records.forEach((record) => {
      const category = record.category
      if (category in categories) {
        categories[category] = categories[category] + 1
      } else {
        categories[category] = 1
      }
    })
    const pieData: PieData[] = []
    Object.keys(categories).forEach((name) => {
      const value = categories[name]
      const percent = (value / records.length) * 100
      pieData.push({ name, value, percent })
    })
    // 値が大きい順にソート
    return pieData.sort((a, b) => b.value - a.value)
  }, [records])

  const onClick = (_: unknown, index: number) => {
    if (index === activeIndex) {
      setActiveIndex(null)
      setShowData(records)
      setFilter('')
    } else {
      setActiveIndex(index)
      const categoryName = data[index].name
      const showData = records.filter(
        (record) => record.category === categoryName
      )
      setFilter(categoryName)
      setShowData(showData)
    }
  }

  const activeData = activeIndex !== null ? data[activeIndex] : null

  return (
    <div
      className="relative"
      style={{ width: '100%', height: '300px' }}
      key={sheet}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            animationDuration={1000}
            onClick={onClick}
            style={{ cursor: 'pointer' }}
            label={({ name, percent }) =>
              percent > 5 ? `${name} ${Math.floor(percent)}%` : ''
            }
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                opacity={
                  activeIndex === null || activeIndex === index ? 1 : 0.4
                }
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {activeData && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded bg-gray-800 px-3 py-2 text-center text-white shadow">
          <p className="font-medium">{activeData.name}</p>
          <p>{`${activeData.value}冊 (${Math.floor(activeData.percent)}%)`}</p>
        </div>
      )}
    </div>
  )
}
