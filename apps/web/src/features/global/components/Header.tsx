import { useRouter } from 'next/router'
import { Container } from '@/components/layout/Container'
import React from 'react'
import { SearchBox } from '@/components/input/SearchBox/SearchBox'
import { useSetAtom } from 'jotai'
import { openNavSidebarAtom, openLoginModalAtom } from '@/store/modal/atom'
import { Logo } from '@/components/icon/Logo'
import Link from 'next/link'
import { useCachedSession } from '@/hooks/useCachedSession'
import { useUnreadNotificationCount } from '@/features/social/hooks/useUnreadNotificationCount'

// レスポンシブヘッダー
export const Header = () => {
  const router = useRouter()
  const { session, status } = useCachedSession()
  const setOpenSidebar = useSetAtom(openNavSidebarAtom)
  const setOpenLoginModal = useSetAtom(openLoginModalAtom)
  const unreadCount = useUnreadNotificationCount()

  if (router.asPath.startsWith('/auth/init')) {
    return null
  }

  return (
    <>
      <div className="sticky top-0 z-40 h-14 w-full bg-main text-white">
        <Container className="flex max-h-16 items-center justify-between gap-2 p-2">
          <Link href="/" className="flex-shrink-0">
            <Logo className="h-8 w-8" />
          </Link>
          <div className="flex-1">
            <SearchBox />
          </div>
          {session ? (
            <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
              <button
                className="relative mr-2 truncate text-base font-bold text-black sm:mr-4"
                onClick={() => setOpenSidebar(true)}
                aria-label={
                  unreadCount > 0
                    ? `メニュー（未読${unreadCount}件）`
                    : 'メニュー'
                }
              >
                <img
                  className="h-10 w-10 rounded-full ring-2 ring-white"
                  src={session.user.image || ''}
                  alt={`${session.user.name || 'ユーザー'}のプロフィール画像`}
                />
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold leading-4 text-white ring-2 ring-main">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
          ) : (
            status !== 'loading' && (
              <button
                className="px-4 py-2 text-sm font-bold text-gray-700"
                onClick={() => setOpenLoginModal(true)}
              >
                ログイン
              </button>
            )
          )}
        </Container>
      </div>
    </>
  )
}
