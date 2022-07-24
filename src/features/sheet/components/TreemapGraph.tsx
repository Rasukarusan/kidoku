import { useMemo } from 'react'
import { Treemap, Tooltip, Legend, TooltipProps } from 'recharts'
import {
  ValueType,
  NameType,
} from 'recharts/src/component/DefaultTooltipContent'
import { ReadingRecord } from '../types'
import { theme } from '@/features/global/theme'

interface Props {
  records: ReadingRecord
}

interface Data {
  name: string
  children: {
    name: string
    size: number
  }[]
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) => {
  if (!(active && payload && payload.length)) return null

  return (
    <div className="custom-tooltip">
      <p className="label" style={{ color: 'white', fontWeight: 400 }}>
        {`${payload[0].payload.name}：${payload[0].value}冊`}
      </p>
      <p className="intro">{label}</p>
      <p className="desc" style={{ color: 'white' }}></p>
    </div>
  )
}

export const TreemapGraph: React.FC<Props> = ({ records }) => {
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
      data.push({ name: key, children: [{ name: key, size: categories[key] }] })
    })
    return data
  }, [records])

  return (
    <Treemap
      width={400}
      height={250}
      data={data}
      dataKey="size"
      stroke="#fff"
      fill={theme.palette.secondary.dark}
      animationDuration={800}
    >
      <Tooltip content={<CustomTooltip />} />
    </Treemap>
  )
}
