import { useMemo, useState } from 'react'
import { Tooltip, ResponsiveContainer, Treemap } from 'recharts'
import { Category } from '../../types'
import { TreemapItem } from '../TreemapItem'

interface Props {
  categories: Category[]
}

// eslint-disable-next-line
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!(active && payload && payload.length)) return null
  const data = payload[0].payload
  return (
    <div className="custom-tooltip">
      <p className="label" style={{ color: 'white', fontWeight: 400 }}>
        {`${data.value}冊 (${Math.floor(data.percent)}%)`}
      </p>
      <p className="intro">{label}</p>
      <p className="desc" style={{ color: 'white' }}></p>
    </div>
  )
}

export const CategoryMap: React.FC<Props> = ({ categories }) => {
  // 各タイルのホバー状態
  const initialHovers = useMemo(() => {
    const hovers: boolean[] = new Array(categories.length).fill(false)
    return hovers
  }, [categories])

  const [hovers, setHovers] = useState<boolean[]>(initialHovers)
  const onMouseEnter = (node) => {
    const newHovers = [...initialHovers]
    newHovers[node.index] = true
    setHovers(newHovers)
  }

  const onMouseLeave = () => {
    setHovers([...initialHovers])
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={categories}
        dataKey="count"
        stroke="#fff"
        animationDuration={1000}
        content={<TreemapItem hovers={hovers} activeIndex={null} />}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  )
}
