import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { SettingsIcon } from '@/components/icon/SettingsIcon'
import { ExitIcon } from '@/components/icon/ExitIcon'
import { BookIcon } from '@/components/icon/BookIcon'
import { SheetAddModal } from './SheetAddModal'
import { SheetDeleteModal } from './SheetDeleteModal'

interface Props {
  currentSheet: string
  username: string
}
export const Menu: React.FC<Props> = ({ currentSheet, username }) => {
  const dropdownRef = useRef(null)
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const isMine = session && session.user.name === username
  const variants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  }

  /**
   * 画面上をクリックしたらメニューを非表示
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {isMine && (
        <>
          <button
            className="py-1 text-center text-2xl text-sm font-bold uppercase text-gray-600 duration-300 ease-in"
            onClick={() => {
              setOpen(!open)
            }}
          >
            <span className="px-2">...</span>
          </button>
          <AnimatePresence>
            {open && (
              <motion.ul
                initial="closed"
                animate="open"
                exit="closed"
                variants={variants}
                className="absolute right-4 z-[1000] m-0 min-w-max list-none overflow-hidden rounded-lg border bg-white bg-clip-padding text-left text-base shadow-lg sm:right-20"
              >
                <li className="border-bottom-1 flex items-center border px-4 py-2 hover:bg-neutral-100">
                  <BookIcon className="mr-2 h-[24px] w-[24px] text-slate-300" />
                  <button
                    className="block w-full whitespace-nowrap bg-transparent text-sm text-gray-600"
                    onClick={() => {
                      setOpen(false)
                      setOpenAdd(true)
                    }}
                  >
                    シートを追加
                  </button>
                </li>
                <li className="border-bottom-1 flex items-center border px-4 py-2 hover:bg-neutral-100">
                  <SettingsIcon className="mr-2 h-[24px] w-[24px] text-slate-300" />
                  <button
                    className="block w-full whitespace-nowrap bg-transparent text-sm text-gray-600"
                    onClick={() => setOpen(false)}
                  >
                    シート名編集
                  </button>
                </li>
                <li className="border-bottom-1 flex items-center border px-4 py-2 hover:bg-neutral-100">
                  <ExitIcon className="mr-2 h-[24px] w-[24px] text-red-600" />
                  <button
                    className="block w-full whitespace-nowrap bg-transparent text-sm text-red-600"
                    onClick={() => {
                      setOpen(false)
                      setOpenDelete(true)
                    }}
                  >
                    シートを削除
                  </button>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
          <SheetAddModal open={openAdd} onClose={() => setOpenAdd(false)} />
          <SheetDeleteModal
            sheet={currentSheet}
            open={openDelete}
            onClose={() => setOpenDelete(false)}
            username={username}
          />
        </>
      )}
    </div>
  )
}
