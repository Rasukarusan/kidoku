import { motion } from 'framer-motion'
import { theme } from '@/features/global/theme'
import { bgColors } from '../util'

export const TreemapItem = (props) => {
  const { depth, x, y, width, height, index, name, hovers, activeIndex } = props
  const isClicked = index === activeIndex

  return (
    <g>
      <motion.rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={depth < 2 ? bgColors[index % 6] : 'rgba(255,255,255,0)'}
        stroke="#fff"
        strokeWidth={2 / (depth + 1e-10)}
        strokeOpacity={1 / (depth + 1e-10)}
        style={{ cursor: 'pointer' }}
      />
      {depth === 1 ? (
        <motion.text
          animate={
            hovers[index] || isClicked ? { scale: 2.0, fontWeight: 700 } : null
          }
          x={x + width / 2}
          y={y + height / 2 + 9}
          textAnchor="middle"
          fill="#fff"
          stroke="none"
          fontSize={18}
        >
          {name}
        </motion.text>
      ) : null}
      {depth === 1 ? (
        <text
          x={x + 4}
          y={y + 22}
          fill="#fff"
          stroke="none"
          fontSize={18}
          fillOpacity={0.5}
        >
          {index + 1}
        </text>
      ) : null}
    </g>
  )
}
