import { useRef, useMemo, useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export interface PieSlice {
  name: string
  value: number
  percent: number
}

interface Props {
  data: PieSlice[]
  outerRadius?: number
  stroke?: string
  onSelect?: (name: string) => void
  onDeselect?: () => void
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

export function BasePieChart({
  data: rawData,
  outerRadius = 100,
  stroke,
  onSelect,
  onDeselect,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const hasInteracted = useRef(false)

  const data = useMemo(() => {
    return [...rawData].sort((a, b) => b.value - a.value)
  }, [rawData])

  const onClick = (_: unknown, index: number) => {
    hasInteracted.current = true
    if (index === activeIndex) {
      setActiveIndex(null)
      onDeselect?.()
    } else {
      setActiveIndex(index)
      onSelect?.(data[index].name)
    }
  }

  const activeData = activeIndex !== null ? data[activeIndex] : null

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={outerRadius}
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
                {...(stroke !== undefined ? { stroke } : {})}
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
