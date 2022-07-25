import { useMemo } from 'react'
import {
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  Line,
} from 'recharts'
import { ReadingRecord, Record } from '../types'
import { theme } from '@/features/global'

interface Props {
  records: ReadingRecord
}

interface Data {
  name: string
  count: number
  sum: number
  children: Record
}

const formatter = (value, name, props) => {
  const label = name === 'sum' ? '累計' : '今月'
  return [`${value}冊`, label]
}

export const BarGraph: React.FC<Props> = ({ records }) => {
  const data = useMemo(() => {
    const months = {}
    records.forEach((record) => {
      const name = record.month
      const hasKey = name in months
      if (hasKey) {
        const v = months[name]
        months[name] = {
          ...v,
          count: v.count + 1,
          children: [...v.children, record],
        }
      } else {
        months[name] = {
          name,
          count: 1,
          children: [record],
        }
      }
    })
    const data: Data[] = []
    Object.keys(months).forEach((month, i) => {
      const count = months[month].children.length
      data.push({
        ...months[month],
        count,
        sum: i === 0 ? count : data[i - 1].sum + count,
      })
    })
    return data
  }, [records])

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <XAxis dataKey="name" />
          <YAxis />
          <CartesianGrid stroke="#f5f5f5" />
          <Tooltip formatter={formatter} />
          <Bar dataKey="sum" barSize={30} fill={theme.palette.primary.main} />
          <Line
            type="monotone"
            dataKey="count"
            stroke={theme.palette.secondary.main}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
