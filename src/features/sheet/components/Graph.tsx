import { useMemo } from 'react'
import { Box } from '@mui/material'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ReadingRecord, Record } from '../types'

interface Props {
  records: ReadingRecord
}

interface Data {
  name: string
  count: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export const Graph: React.FC<Props> = ({ records }) => {
  const data = useMemo(() => {
    const categories = {}
    records.forEach((record) => {
      const category = record.category
      const hasKey = category in categories
      if (hasKey) {
        categories[category] = categories[category] + 1
      } else {
        categories[category] = 1
      }
    })
    const data: Data[] = []
    Object.keys(categories).forEach((key) => {
      data.push({ name: key, count: categories[key] })
    })
    console.log(data)
    return data
  }, [records])

  const renderLabel = function (entry) {
    // console.log(entry)
    return `${entry.name} ${Math.floor(entry.percent * 100)}%`
  }
  return (
    <Box sx={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            isAnimationActive={false}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label={renderLabel}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  )
}
