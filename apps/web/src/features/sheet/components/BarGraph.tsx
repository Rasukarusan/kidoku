import { useMemo, useState } from 'react'
import {
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  CartesianGrid,
  Bar,
  Line,
  Cell,
} from 'recharts'
import { Book } from '@/types/book'

interface Props {
  records: Book[]
  setShowData: (newData: Book[]) => void
  setFilter: (filter: string) => void
}

interface Data {
  name: string
  count: number
  sum: number
  children: Book[]
}

const formatter = (value, name) => {
  const label = name === 'sum' ? '累計' : '今月'
  return [`${value}冊`, label]
}

const colors = [
  '#003049',
  '#021E66',
  '#D62828',
  '#F77F00',
  '#564779',
  '#FCBF49',
  '#EAE2B7',
  '#F76E7C',
  '#F73668',
  '#FF7F75',
  '#F0EAD8',
  '#2B2F6C',
]

export const BarGraph: React.FC<Props> = ({
  records,
  setShowData,
  setFilter,
}) => {
  const data = useMemo(() => {
    // 入力レコードの順序に関係なく、0冊の月も含めて1〜12月を表示する。
    const months: Omit<Data, 'sum'>[] = Array.from({ length: 12 }, (_, i) => ({
      name: `${i + 1}月`,
      count: 0,
      children: [],
    }))
    records.forEach((record) => {
      const month = months.find((month) => month.name === record.month)
      if (month) {
        month.count += 1
        month.children.push(record)
      }
    })
    let sum = 0
    return months.map((month): Data => {
      sum += month.count
      return { ...month, sum }
    })
  }, [records])

  const onClick = (node, index) => {
    if (index === activeIndex) {
      setActiveIndex(null)
      setShowData(records)
      setFilter('')
    } else {
      setActiveIndex(index)
      const newData = data.filter((v) => v.name === node.name)[0].children
      setFilter(node.name)
      setShowData(newData)
    }
  }

  const [activeIndex, setActiveIndex] = useState(null)

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
        >
          <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
          <CartesianGrid stroke="#f5f5f5" />
          <Tooltip formatter={formatter} />
          <Bar dataKey="sum" barSize={30} onClick={onClick}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                cursor="pointer"
                fill={colors[index]}
              />
            ))}
          </Bar>
          <Line type="monotone" dataKey="count" stroke="#00C49F" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
