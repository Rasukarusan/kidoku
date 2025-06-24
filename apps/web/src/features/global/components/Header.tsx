import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { Container } from '@/components/layout/Container'
import React from 'react'
import Link from 'next/link'
import { SearchBox } from '@/components/input/SearchBox/SearchBox'
import { Logo } from '@/components/icon/Logo'
import { useSetAtom } from 'jotai'
import { openLoginModalAtom, openNavSidebarAtom } from '@/store/modal/atom'
import { twMerge } from 'tailwind-merge'

// レスポンシブヘッダー
export const Header = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const setOpen = useSetAtom(openLoginModalAtom)
  const setOpenSidebar = useSetAtom(openNavSidebarAtom)

  if (router.asPath.startsWith('/auth/init')) {
    return null
  }

  return (
    <>
      <div
        className={twMerge(
          'sticky top-0 z-40 h-16 w-full border-b border-gray-200 bg-main text-white',
          session && 'lg:left-60'
        )}
      >
        <Container className="flex max-h-16 items-center p-2">
          <Link href="/" className="mr-2 no-underline sm:mr-4">
            <Logo className="h-8 min-h-8 w-8 min-w-8" />
          </Link>
          <div className="mr-2 flex-grow sm:mr-4 sm:flex-grow-0 lg:ml-12">
            <SearchBox />
          </div>
          {session && (
            <button
              className="mr-2 truncate text-base font-bold text-black sm:mr-4 lg:hidden"
              onClick={() => setOpenSidebar(true)}
            >
              <img
                className="h-10 w-10 rounded-full ring-2 ring-white"
                src={session.user.image || ''}
                alt={`${session.user.name || 'ユーザー'}のプロフィール画像`}
              />
            </button>
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
    </>
  )
}
