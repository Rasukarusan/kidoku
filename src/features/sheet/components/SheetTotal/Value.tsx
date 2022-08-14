import { motion } from 'framer-motion'
import { useCountUp } from '../../hooks'

interface Props {
  value: number
  unit: string
}
export const Value: React.FC<Props> = ({ value, unit }) => {
  const count = useCountUp(value)
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
