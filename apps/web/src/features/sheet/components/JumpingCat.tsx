import { motion } from 'framer-motion'
import { CatIcon } from '@/components/icon/CatIcon'

interface Props {
  position?: 'top-right' | 'top-left'
}

export const JumpingCat: React.FC<Props> = ({ position = 'top-right' }) => {
  const positionClasses = {
    'top-right': 'right-[-8px] top-[-8px]',
    'top-left': 'left-[-8px] top-[-8px]',
  }

  return (
    <motion.div
      className={`absolute z-20 ${positionClasses[position]}`}
      initial={{
        y: -80,
        x: position === 'top-right' ? 20 : -20,
        rotate: position === 'top-right' ? -25 : 25,
        opacity: 0,
        scale: 0.2,
      }}
      animate={{
        y: 0,
        x: 0,
        rotate: 0,
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: 'spring',
        damping: 10,
        stiffness: 180,
        duration: 0.7,
        opacity: { duration: 0.15 },
      }}
    >
      {/* 着地時のインパクトリング（複数） */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 2, 0], opacity: [0, 0.8, 0] }}
        transition={{
          delay: 0.35,
          duration: 0.6,
          ease: 'easeOut',
        }}
      >
        <div className="h-12 w-12 rounded-full border-2 border-orange-400/60" />
      </motion.div>

      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 0], opacity: [0, 0.6, 0] }}
        transition={{
          delay: 0.4,
          duration: 0.5,
          ease: 'easeOut',
        }}
      >
        <div className="h-10 w-10 rounded-full bg-orange-400/40" />
      </motion.div>

      {/* 猫の影（着地感を出すため） */}
      <motion.div
        className="absolute left-1/2 top-[36px] -translate-x-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{
          delay: 0.3,
          duration: 0.4,
          ease: 'easeOut',
        }}
      >
        <div className="h-1.5 w-8 rounded-full bg-black/50 blur-[2px]" />
      </motion.div>

      {/* 猫本体 */}
      <motion.div
        className="drop-shadow-xl"
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          delay: 0.7,
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <CatIcon size={36} />
      </motion.div>

      {/* キラキラエフェクト（左） */}
      <motion.div
        className="absolute left-[-4px] top-[8px] text-yellow-400"
        initial={{ scale: 0, rotate: 0, opacity: 0 }}
        animate={{
          scale: [0, 1, 0],
          rotate: [0, 180, 360],
          opacity: [0, 1, 0],
        }}
        transition={{
          delay: 0.45,
          duration: 0.8,
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
        </svg>
      </motion.div>

      {/* キラキラエフェクト（右） */}
      <motion.div
        className="absolute right-[-4px] top-[12px] text-yellow-300"
        initial={{ scale: 0, rotate: 0, opacity: 0 }}
        animate={{
          scale: [0, 1, 0],
          rotate: [0, -180, -360],
          opacity: [0, 1, 0],
        }}
        transition={{
          delay: 0.5,
          duration: 0.7,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
        </svg>
      </motion.div>

      {/* キラキラエフェクト（下） */}
      <motion.div
        className="absolute bottom-[2px] left-[14px] text-yellow-200"
        initial={{ scale: 0, rotate: 0, opacity: 0 }}
        animate={{
          scale: [0, 0.8, 0],
          rotate: [0, 90, 180],
          opacity: [0, 1, 0],
        }}
        transition={{
          delay: 0.55,
          duration: 0.6,
        }}
      >
        <svg width="8" height="8" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
        </svg>
      </motion.div>
    </motion.div>
  )
}
