import { useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
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

// eslint-disable-next-line
const CustomTooltip = ({ active, payload }: any) => {
  if (!(active && payload && payload.length)) return null
  const data = payload[0].payload
  return (
    <div className="rounded bg-gray-800 px-3 py-2 text-white shadow">
      <p className="font-medium">{data.name}</p>
      <p>{`${data.value}冊 (${Math.floor(data.percent)}%)`}</p>
    </div>
  )
}

export function TreemapGraph({
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

  return (
    <div style={{ width: '100%', height: '300px' }} key={sheet}>
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
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                opacity={
                  activeIndex === null || activeIndex === index ? 1 : 0.4
                }
                stroke={activeIndex === index ? '#000' : '#fff'}
                strokeWidth={activeIndex === index ? 2 : 1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
