import { Component } from 'react'
import { motion } from 'framer-motion'

export const TreemapItem = (props) => {
  const { depth, x, y, width, height, index, name, animates } = props

  const bgColors = [
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#0C8CC2',
    '#F73E58',
    '#507C8F',
    '#FF8042',
    '#27F5C1',
  ]
  return (
    <g>
      <rect
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
          animate={animates[index] ? { scale: 2.0 } : null}
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
