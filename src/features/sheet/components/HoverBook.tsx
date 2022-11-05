import { motion } from 'framer-motion'
import { Record } from '../types'
interface Props {
  book: Record
  onMouseLeave: (i: number) => void
}

export const HoverBook: React.FC<Props> = ({ book, onMouseLeave }) => {
  return (
    <motion.div
      animate={{ scale: 1.2, color: '#263238' }}
      style={{
        position: 'absolute',
        top: 0,
        zIndex: 10,
        width: '250px',
        background: 'white',
      }}
      onMouseLeave={() => onMouseLeave(-1)}
    >
      <div style={{}}>
        <img src={book.image} alt="" width={128} height={186} />
      </div>
      <div>{book.title}</div>
      <div>{book.author}</div>
    </motion.div>
  )
}
