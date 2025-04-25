import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import { twMerge } from 'tailwind-merge'

export const Accordion = ({ title, children, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className={twMerge('rounded-md', className)}>
      <button
        className={twMerge(
          'flex w-full items-center justify-between rounded-md border-gray-200 p-2 text-left focus:ring-gray-200',
          isOpen ? 'border-b' : 'border'
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div>{title}</div>
        {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
