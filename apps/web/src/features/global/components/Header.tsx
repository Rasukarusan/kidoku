import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { Container } from '@/components/layout/Container'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { SearchBox } from '@/components/input/SearchBox/SearchBox'
import { Logo } from '@/components/icon/Logo'
import { useSetAtom } from 'jotai'
import { openLoginModalAtom } from '@/store/modal/atom'
import { UserMenu } from './UserMenu'
import { useQuery } from '@apollo/client'
import { GET_SHEETS } from '@/libs/apollo/queries'

// レスポンシブヘッダー
export const Header = () => {
  const router = useRouter()
  const dropdownRef = useRef(null)
  const { data: session } = useSession()
  const setOpen = useSetAtom(openLoginModalAtom)
  const [openMenu, setOpenMenu] = useState(false)
  const { data } = useQuery(GET_SHEETS)

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

  const sheets = data?.sheets || []
  const url = !session
    ? '/'
    : sheets.length > 0
      ? `/${session.user.name}/sheets/${sheets[0].name}`
      : `/${session.user.name}/sheets/total`

  if (router.asPath.startsWith('/auth/init')) {
    return null
  }

  return (
    <>
      <div className="fixed top-0 z-50 w-full bg-main text-white">
        <Container className="flex max-h-16 items-center p-2">
          <Link href="/" className="mr-2 no-underline sm:mr-4">
            <Logo className="h-8 min-h-8 w-8 min-w-8" />
          </Link>
          <div className="mr-2 sm:mr-4">
            <SearchBox />
          </div>
          <div className="flex-grow"></div>
          {session && (
            <>
              <Link
                className="mr-2 truncate text-base font-bold text-black sm:mr-4"
                href={url}
              >
                {session.user.name}
              </Link>
              <div
                className="relative max-h-[40px] max-w-[40px]"
                ref={dropdownRef}
              >
                <button
                  className="h-[34px] w-[34px] rounded-full bg-gray-200 sm:mr-2 sm:mr-4 sm:h-[40px] sm:w-[40px]"
                  onClick={() => setOpenMenu(!openMenu)}
                >
                  <img
                    src={session.user.image}
                    alt="ユーザーアイコン"
                    className="max-h-[40px]  max-w-[40px] rounded-full "
                  />
                </button>
                <UserMenu open={openMenu} setOpen={setOpenMenu} url={url} />
              </div>
            </>
          )}
          {session === null && (
            <>
              <button
                className="rounded-md px-4 py-2 text-xs font-bold text-gray-700 sm:px-5 sm:py-2 sm:text-sm"
                onClick={() => setOpen(true)}
              >
                ログイン
              </button>
            </>
          )}
        </Container>
      </div>
      <div style={{ marginBottom: '70px' }}></div>
    </>
  )
}
