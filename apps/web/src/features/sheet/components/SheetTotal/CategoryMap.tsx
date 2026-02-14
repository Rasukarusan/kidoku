import { useMemo } from 'react'
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts'
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
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke="#000"
      strokeWidth={2}
    />
  )
}

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
  const data = useMemo(() => {
    return [...categories].sort((a, b) => b.count - a.count)
  }, [categories])

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
          activeShape={renderActiveShape}
          label={({ name, percent }) =>
            percent > 5 ? `${name} ${Math.floor(percent)}%` : ''
          }
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              stroke="#fff"
              strokeWidth={1}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
