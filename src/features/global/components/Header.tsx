import { useRouter } from 'next/router'
import { AppBar, Toolbar, Container } from '@mui/material'
import { signOut, useSession } from 'next-auth/react'
import { LoginModal } from './LoginModal'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { SettingsIcon } from '@/components/icon/SettingsIcon'
import { ExitIcon } from '@/components/icon/ExitIcon'
import { BookIcon } from '@/components/icon/BookIcon'
import Link from 'next/link'
import { SearchBox } from '@/components/input/SearchBox/SearchBox'

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

  return (
    <>
      <AppBar position="fixed" color="primary" sx={{ boxShadow: 'none' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Link
              href="/"
              className="mr-8 font-bold tracking-[.3rem] no-underline font-['Nico_Moji'] text-xl"
            >
              Kidoku
            </Link>
            <SearchBox />
            <div className="flex-grow"></div>
            {session && (
              <div className="relative" ref={dropdownRef}>
                <button
                  className="rounded-full bg-gray-200 w-[34px] h-[34px] sm:w-[40px] sm:h-[40px] sm:mr-4"
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
                      className="absolute z-[1000] right-4 m-0 min-w-max list-none overflow-hidden rounded-lg border bg-white bg-clip-padding text-left text-base shadow-lg"
                    >
                      <li className="border border-bottom-1 flex items-center px-4 py-2 hover:bg-neutral-100">
                        <BookIcon className="w-[24px] h-[24px] text-slate-300 mr-2" />
                        <Link
                          className="block w-full whitespace-nowrap text-gray-600 bg-transparent text-sm"
                          href={`/${session.user.name}/sheets`}
                          onClick={() => setOpenMenu(false)}
                        >
                          読書記録
                        </Link>
                      </li>
                      <li className="border border-bottom-1 flex items-center px-4 py-2 hover:bg-neutral-100">
                        <SettingsIcon className="w-[24px] h-[24px] text-slate-300 mr-2" />
                        <Link
                          className="block w-full whitespace-nowrap text-gray-600 bg-transparent text-sm"
                          href="/settings/profile"
                          onClick={() => setOpenMenu(false)}
                        >
                          アカウント設定
                        </Link>
                      </li>
                      <li className="border border-bottom-1 flex items-center px-4 py-2 hover:bg-neutral-100">
                        <ExitIcon className="w-[24px] h-[24px] text-slate-300 mr-2" />
                        <button
                          className="block w-full whitespace-nowrap text-gray-600 bg-transparent text-sm text-left"
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
                  className="rounded-md bg-[#4f5b62] text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2 font-bold"
                  onClick={() => setOpen(true)}
                >
                  ログイン
                </button>
                <LoginModal open={open} onClose={() => setOpen(false)} />
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <div style={{ marginBottom: '70px' }}></div>
    </>
  )
}
