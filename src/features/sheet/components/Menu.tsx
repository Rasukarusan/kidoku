import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { SheetAddModal } from './SheetAddModal'
import { SheetDeleteModal } from './SheetDeleteModal'
import { SheetEditModal } from './SheetEditModal'
import {
  AiOutlineFileAdd,
  AiOutlineEdit,
  AiOutlineDelete,
} from 'react-icons/ai'
import { BsThreeDots } from 'react-icons/bs'

interface Props {
  currentSheet: string
  username: string
  activate?: {
    edit: boolean
    delete: boolean
  }
}
export const Menu: React.FC<Props> = ({
  currentSheet,
  username,
  activate = { edit: true, delete: true },
}) => {
  const dropdownRef = useRef(null)
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
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
            <BsThreeDots />
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
                  <AiOutlineFileAdd className="mr-2 h-[24px] w-[24px] text-slate-300" />
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
                <li
                  className={`border-bottom-1 flex items-center border px-4 py-2 hover:bg-neutral-100 ${
                    !activate.edit ? 'bg-neutral-100' : ''
                  }`}
                >
                  <AiOutlineEdit className="mr-2 h-[24px] w-[24px] text-slate-300" />
                  <button
                    className={`block w-full whitespace-nowrap bg-transparent text-sm
                      ${!activate.edit ? 'text-gray-400' : 'text-gray-600'}`}
                    onClick={() => {
                      setOpen(false)
                      setOpenEdit(true)
                    }}
                    disabled={!activate.edit}
                  >
                    シート名編集
                  </button>
                </li>
                <li
                  className={`border-bottom-1 flex items-center border px-4 py-2 hover:bg-neutral-100 ${
                    !activate.delete ? 'bg-neutral-100' : ''
                  }`}
                >
                  <AiOutlineDelete
                    className={`mr-2 h-[24px] w-[24px] ${
                      !activate.delete ? 'text-slate-300' : 'text-red-600'
                    }`}
                  />
                  <button
                    className={`block w-full whitespace-nowrap bg-transparent text-sm ${
                      !activate.delete ? 'text-gray-400' : 'text-red-600'
                    }`}
                    onClick={() => {
                      setOpen(false)
                      setOpenDelete(true)
                    }}
                    disabled={!activate.delete}
                  >
                    シートを削除
                  </button>
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
          <SheetAddModal open={openAdd} onClose={() => setOpenAdd(false)} />
          <SheetEditModal
            sheet={currentSheet}
            open={openEdit}
            onClose={() => setOpenEdit(false)}
            username={username}
          />
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
