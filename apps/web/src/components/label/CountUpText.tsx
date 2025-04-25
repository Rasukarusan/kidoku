import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function useCountUp(value: number, step: number) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      i = i + step
      setCount(i)
      if (i > value) {
        setCount(value)
        clearInterval(interval)
      }
    }, 10)
  }, [value])
  return count
}

interface Props {
  value: number
  unit: string
  step?: number
}
export const CoutUpText: React.FC<Props> = ({ value, unit, step = 10 }) => {
  const count = useCountUp(value, step)
  return (
    <motion.div
      style={{ fontWeight: 700, fontSize: '80px' }}
      whileHover={{ scale: 1.5, color: '#263238' }}
    >
      <motion.span animate={{ opacity: [0.1, 0.3, 0.6, 1] }}>
        {count}
      </motion.span>
      {unit}
    </motion.div>
  )
}
