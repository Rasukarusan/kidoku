import { useRef, useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
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

export const CategoryMap: React.FC<Props> = ({ categories }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const hasInteracted = useRef(false)

  const data = useMemo(() => {
    return [...categories].sort((a, b) => b.count - a.count)
  }, [categories])

  const onClick = (_: unknown, index: number) => {
    hasInteracted.current = true
    if (index === activeIndex) {
      setActiveIndex(null)
    } else {
      setActiveIndex(index)
    }
  }

  const activeData = activeIndex !== null ? data[activeIndex] : null

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            animationDuration={hasInteracted.current ? 0 : 1000}
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
                stroke="none"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {activeData && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded bg-gray-800 px-3 py-2 text-center text-white shadow">
          <p className="font-medium">{activeData.name}</p>
          <p>{`${activeData.count}冊 (${Math.floor(activeData.percent)}%)`}</p>
        </div>
      )}
    </div>
  )
}
