import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export const Modal: React.FC<Props> = ({
  open,
  onClose,
  children,
  className = '',
}) => {
  useEffect(() => {
    if (open) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed left-0 top-0 z-[1000] flex h-full w-full items-center justify-center overflow-y-hidden bg-[rgba(0,0,0,0.1)] p-4 backdrop-blur-[4px] sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.2 } }}
          onClick={onClose}
        >
          <div
            className={`m-2 flex flex-col rounded-md bg-white text-gray-700 sm:m-0 ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
