import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { Container } from '@/components/layout/Container'
import React from 'react'
import { SearchBox } from '@/components/input/SearchBox/SearchBox'
import { useSetAtom } from 'jotai'
import { openNavSidebarAtom, openLoginModalAtom } from '@/store/modal/atom'

// レスポンシブヘッダー
export const Header = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const setOpenSidebar = useSetAtom(openNavSidebarAtom)
  const setOpenLoginModal = useSetAtom(openLoginModalAtom)

  if (router.asPath.startsWith('/auth/init')) {
    return null
  }

  return (
    <>
      <div className="sticky top-0 z-40 h-14 w-full bg-main text-white">
        <Container className="flex max-h-16 items-center justify-between gap-2 p-2">
          <div className="flex-1">
            <SearchBox />
          </div>
          {session ? (
            <button
              className="mr-2 truncate text-base font-bold text-black sm:mr-4"
              onClick={() => setOpenSidebar(true)}
            >
              <img
                className="h-10 w-10 rounded-full ring-2 ring-white"
                src={session.user.image || ''}
                alt={`${session.user.name || 'ユーザー'}のプロフィール画像`}
              />
            </button>
          ) : (
            <button
              className="px-4 py-2 text-sm font-bold text-gray-700"
              onClick={() => setOpenLoginModal(true)}
            >
              ログイン
            </button>
          )}
        </Container>
      </div>
    </>
  )
}
