import useSWR from 'swr'
import { fetcher } from '@/libs/swr'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import { Container } from '@/components/layout/Container'
import { LoginModal } from './LoginModal'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SearchBox } from '@/components/input/SearchBox/SearchBox'
import { Logo } from '@/components/icon/Logo'
import { AiOutlineBook, AiOutlineSetting } from 'react-icons/ai'
import { BiExit } from 'react-icons/bi'

// レスポンシブヘッダー
export const Header = () => {
  const router = useRouter()
  const dropdownRef = useRef(null)
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const variants: Variants = {
    open: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
    closed: { opacity: 0, y: 20, transition: { duration: 0.2 } },
  }
  const { data: sheets } = useSWR(`/api/sheets`, fetcher, {
    fallbackData: { result: true, sheets: [] },
  })

  /**
   * 画面上をクリックしたらメニューを非表示
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const url = !session
    ? '/'
    : sheets.sheets.length > 0
    ? `/${session.user.name}/sheets/${sheets.sheets[0].name}`
    : `/${session.user.name}/sheets/total`

  return (
    <>
      <div className="fixed top-0 z-50 w-full bg-main text-white">
        <Container className="flex items-center p-2">
          <Link
            href="/"
            className="mr-8 font-['Nico_Moji'] text-xl font-bold tracking-[.3rem] no-underline"
          >
            <Logo className="h-8 w-8" />
          </Link>
          <SearchBox />
          <div className="flex-grow"></div>
          {session && (
            <div className="relative" ref={dropdownRef}>
              <button
                className="h-[34px] w-[34px] rounded-full bg-gray-200 sm:mr-4 sm:h-[40px] sm:w-[40px]"
                onClick={() => setOpenMenu(!openMenu)}
              >
                <img
                  src={session.user.image}
                  alt="ユーザーアイコン"
                  className="rounded-full"
                />
              </button>
              <AnimatePresence>
                {openMenu && (
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
                        onClick={() => setOpenMenu(false)}
                      >
                        読書記録
                      </Link>
                    </li>
                    <li className="border-bottom-1 flex items-center border px-4 py-2 hover:bg-neutral-100">
                      <AiOutlineSetting className="mr-2 h-[24px] w-[24px] text-slate-300" />
                      <Link
                        className="block w-full whitespace-nowrap bg-transparent text-sm text-gray-600"
                        href="/settings/profile"
                        onClick={() => setOpenMenu(false)}
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
            </div>
          )}
          {session === null && (
            <>
              <button
                className="rounded-md bg-[#4f5b62] px-4 py-2 text-xs font-bold sm:px-5 sm:py-2 sm:text-sm"
                onClick={() => setOpen(true)}
              >
                ログイン
              </button>
              <LoginModal open={open} onClose={() => setOpen(false)} />
            </>
          )}
        </Container>
      </div>
      <div style={{ marginBottom: '70px' }}></div>
    </>
  )
}
