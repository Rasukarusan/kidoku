import { motion } from 'framer-motion'
import { Canvas } from '@react-three/fiber'
import { Cat3DModel } from '@/components/3d/Cat3DModel'
import { Suspense } from 'react'

interface Props {
  position?: 'top-right' | 'top-left'
}

export const JumpingCat: React.FC<Props> = ({ position = 'top-right' }) => {
  const positionClasses = {
    'top-right': 'right-[-20px] top-[-20px]',
    'top-left': 'left-[-20px] top-[-20px]',
  }

  return (
    <motion.div
      className={`absolute z-20 ${positionClasses[position]}`}
      style={{ width: '120px', height: '120px', pointerEvents: 'none' }}
      initial={{
        y: -100,
        x: position === 'top-right' ? 30 : -30,
        rotateZ: position === 'top-right' ? -30 : 30,
        opacity: 0,
        scale: 0.3,
      }}
      animate={{
        y: 0,
        x: 0,
        rotateZ: 0,
        opacity: 1,
        scale: 1,
      }}
      transition={{
        type: 'spring',
        damping: 12,
        stiffness: 180,
        duration: 0.8,
        opacity: { duration: 0.2 },
      }}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: 5, // ACESFilmicToneMapping
          toneMappingExposure: 1.2,
        }}
      >
        <Suspense fallback={null}>
          <Cat3DModel />
          <color attach="background" args={['transparent']} />
        </Suspense>
      </Canvas>
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
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.5 }}
        transition={{
          delay: 0.4,
          duration: 0.5,
          ease: 'easeOut',
        }}
      >
        <div className="h-2 w-16 rounded-full bg-black/60 blur-md" />
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
