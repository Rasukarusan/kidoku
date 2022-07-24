import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ResponsiveContainer,
  Treemap,
  Tooltip,
  Legend,
  TooltipProps,
} from 'recharts'
import {
  ValueType,
  NameType,
} from 'recharts/src/component/DefaultTooltipContent'
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

function getRandomInt(max) {
  return Math.floor(Math.random() * max)
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
          fill="#8889DD"
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
