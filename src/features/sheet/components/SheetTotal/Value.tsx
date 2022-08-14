import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getRandomColor } from '../../util'

interface Props {
  value: number
  unit: string
}
export const Value: React.FC<Props> = ({ value, unit }) => {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i = i + 1
      setCount(i)
      if (i > value) {
        setCount(value)
        clearInterval(interval)
      }
    }, 10)
  }, [value])
  return (
    <motion.div
      style={{ fontWeight: 700, fontSize: '80px' }}
      whileHover={{ scale: 1.5, color: getRandomColor() }}
    >
      <motion.span animate={{ opacity: [0.1, 0.3, 0.6, 1] }}>
        {count}
      </motion.span>
      {unit}
    </motion.div>
  )
}
