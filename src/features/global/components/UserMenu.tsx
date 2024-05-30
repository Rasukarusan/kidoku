import useSWR from 'swr'
import Link from 'next/link'
import { Dispatch, SetStateAction } from 'react'
import { BiExit } from 'react-icons/bi'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { signOut, useSession } from 'next-auth/react'
import { AiOutlineBook, AiOutlineSetting } from 'react-icons/ai'
import { fetcher } from '@/libs/swr'

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export const UserMenu: React.FC<Props> = ({ open, setOpen }) => {
  const { data: session } = useSession()
  const { data: sheets } = useSWR(`/api/sheets`, fetcher, {
    fallbackData: { result: true, sheets: [] },
  })

  const variants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  }
  const url = !session
    ? '/'
    : sheets.sheets.length > 0
      ? `/${session.user.name}/sheets/${sheets.sheets[0].name}`
      : `/${session.user.name}/sheets/total`

  return (
    <AnimatePresence>
      {open && (
        <motion.ul
          initial="closed"
          animate="open"
          exit="closed"
          variants={variants}
          className="absolute right-4 z-[1000] m-0 min-w-max list-none overflow-hidden rounded-lg border bg-white bg-clip-padding text-left text-base shadow-lg"
        >
          <li className="border-bottom-1 flex items-center border px-4 py-2 hover:bg-neutral-100">
            <AiOutlineBook className="mr-2 h-[24px] w-[24px] text-slate-300" />
            <Link
              className="block w-full whitespace-nowrap bg-transparent text-sm text-gray-600"
              href={url}
              onClick={() => setOpen(false)}
            >
              読書記録
            </Link>
          </li>
          <li className="border-bottom-1 flex items-center border px-4 py-2 hover:bg-neutral-100">
            <AiOutlineSetting className="mr-2 h-[24px] w-[24px] text-slate-300" />
            <Link
              className="block w-full whitespace-nowrap bg-transparent text-sm text-gray-600"
              href="/settings/profile"
              onClick={() => setOpen(false)}
            >
              アカウント設定
            </Link>
          </li>
          <li className="border-bottom-1 flex items-center border px-4 py-2 hover:bg-neutral-100">
            <BiExit className="mr-2 h-[24px] w-[24px] text-slate-300" />
            <button
              className="block w-full whitespace-nowrap bg-transparent text-left text-sm text-gray-600"
              onClick={() => signOut()}
            >
              ログアウト
            </button>
          </li>
        </motion.ul>
      )}
    </AnimatePresence>
  )
}
