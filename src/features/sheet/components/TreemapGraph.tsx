import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  Treemap,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts'
import { ReadingRecord } from '../types'
import { theme } from '@/features/global/theme'
import { TreemapItem } from './TreemapItem'

interface Props {
  records: ReadingRecord
}

interface Data {
  name: string
  children: {
    name: string
    size: number
    percent: number
  }[]
}

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

  const initialAnimates = useMemo(() => {
    const animates: boolean[] = new Array(data.length).fill(false)
    return animates
  }, [records])

  const [animates, setAnimates] = useState(initialAnimates)

  const onClick = (e) => {
    console.log(e)
  }

  const onMouseEnter = (node, e) => {
    const newAnimates = [...initialAnimates]
    newAnimates[node.root.index] = true
    setAnimates(newAnimates)
  }

  const onMouseLeave = (node, e) => {
    setAnimates([...initialAnimates])
  }

  return (
    <motion.div
      style={{ width: '100%', height: '300px' }}
      whileHover={{
        scale: 1.0,
        rotate: 0,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          stroke="#fff"
          animationDuration={1500}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          content={<TreemapItem animates={animates} />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </motion.div>
  )
}
