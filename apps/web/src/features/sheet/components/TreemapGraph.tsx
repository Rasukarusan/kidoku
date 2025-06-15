import { useMemo, useState } from 'react'
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts'
import { Book } from '@/types/book'
import { TreemapItem } from './TreemapItem'

interface Props {
  sheet: string
  records: Book[]
  setShowData: (newData: Book[]) => void
  setFilter: (filter: string) => void
}

interface Data {
  name: string
  children: {
    name: string
    size: number
    percent: number
  }[]
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

export const TreemapGraph: React.FC<Props> = ({
  sheet,
  records,
  setShowData,
  setFilter,
}) => {
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
    Object.keys(categories).forEach((name) => {
      const size = categories[name]
      const percent = (size / records.length) * 100
      data.push({
        name,
        children: [{ name, size, percent }],
      })
    })
    return data
  }, [records])

  const initialHovers = useMemo(() => {
    const hovers: boolean[] = new Array(data.length).fill(false)
    return hovers
  }, [records])

  // 各タイルのホバー状態
  const [hovers, setHovers] = useState<boolean[]>(initialHovers)

  // クリックしているタイルのインデックス
  const [activeIndex, setActiveIndex] = useState(null)

  const onClick = (node) => {
    const index = node.root.index
    if (index === activeIndex) {
      setActiveIndex(null)
      setShowData(records)
      setFilter('')
    } else {
      setActiveIndex(index)
      const showData = records.filter((record) => record.category === node.name)
      setFilter(node.name)
      setShowData(showData)
    }
  }

  const onMouseEnter = (node) => {
    const newHovers = [...initialHovers]
    newHovers[node.root.index] = true
    setHovers(newHovers)
  }

  const onMouseLeave = () => {
    setHovers([...initialHovers])
  }

  return (
    <div style={{ width: '100%', height: '300px' }} key={sheet}>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          stroke="#fff"
          animationDuration={1500}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          content={<TreemapItem hovers={hovers} activeIndex={activeIndex} />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  )
}
