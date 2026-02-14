import { useMemo, useState } from 'react'
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Category } from '../../types'

interface Props {
  categories: Category[]
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
      <p>{`${data.count}冊 (${Math.floor(data.percent)}%)`}</p>
    </div>
  )
}

export const CategoryMap: React.FC<Props> = ({ categories }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const data = useMemo(() => {
    return [...categories].sort((a, b) => b.count - a.count)
  }, [categories])

  const onClick = (_: unknown, index: number) => {
    if (index === activeIndex) {
      setActiveIndex(null)
    } else {
      setActiveIndex(index)
    }
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={120}
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
              opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
              stroke={activeIndex === index ? '#000' : '#fff'}
              strokeWidth={activeIndex === index ? 2 : 1}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
