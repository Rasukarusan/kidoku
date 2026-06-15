import React, { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  AiOutlineHome,
  AiFillHome,
  AiOutlineBook,
  AiFillBook,
  AiOutlinePlusCircle,
  AiFillPlusCircle,
  AiOutlineCompass,
  AiFillCompass,
  AiOutlineBell,
  AiFillBell,
} from 'react-icons/ai'
import { useAtom } from 'jotai'
import { useQuery } from '@apollo/client'
import { useCachedSession } from '@/hooks/useCachedSession'
import { useReadingRecordsUrl } from '@/hooks/useReadingRecordsUrl'
import { openSearchModalAtom } from '@/store/modal/atom'
import { unreadNotificationCountQuery } from '@/features/social/api'

export const BottomNav: React.FC = () => {
  const router = useRouter()
  const { session, status } = useCachedSession()
  const readingRecordsUrl = useReadingRecordsUrl()
  const [, setOpenSearchModal] = useAtom(openSearchModalAtom)

  const { data: unreadData } = useQuery(unreadNotificationCountQuery, {
    skip: status !== 'authenticated',
    pollInterval: 60000,
  })
  const unread: number = unreadData?.unreadNotificationCount ?? 0

  const navigationItems = useMemo(() => {
    const isHomePage = router.pathname === '/'
    const isSheetsPage = router.pathname.includes('/sheets')
    const isDiscoverPage = router.pathname.includes('/discover')
    const isNotificationsPage = router.pathname.includes('/notifications')

    return [
      {
        name: 'ホーム',
        href: '/',
        icon: AiOutlineHome,
        activeIcon: AiFillHome,
        isActive: isHomePage,
        badge: 0,
      },
      {
        name: '読書記録',
        href: readingRecordsUrl,
        icon: AiOutlineBook,
        activeIcon: AiFillBook,
        isActive: isSheetsPage,
        badge: 0,
      },
      {
        name: '本を登録',
        icon: AiOutlinePlusCircle,
        activeIcon: AiFillPlusCircle,
        isActive: false,
        onClick: () => setOpenSearchModal(true),
        badge: 0,
      },
      {
        name: '発見',
        href: '/discover',
        icon: AiOutlineCompass,
        activeIcon: AiFillCompass,
        isActive: isDiscoverPage,
        badge: 0,
      },
      {
        name: 'お知らせ',
        href: '/notifications',
        icon: AiOutlineBell,
        activeIcon: AiFillBell,
        isActive: isNotificationsPage,
        badge: unread,
      },
    ]
  }, [readingRecordsUrl, router.pathname, setOpenSearchModal, unread])

  if (status !== 'authenticated' || !session) {
    return null
  }

  if (router.asPath.startsWith('/auth/init')) {
    return null
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white"
      aria-label="ボトムナビゲーション"
    >
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-around">
        {navigationItems.map((item) => {
          const Icon = item.isActive ? item.activeIcon : item.icon
          const classes = `flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-xs transition-colors ${
            item.isActive
              ? 'font-semibold text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`

          const iconWithBadge = (
            <span className="relative">
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.badge > 0 && (
                <span className="absolute -right-2 -top-1.5 flex min-w-[16px] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold leading-4 text-white">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </span>
          )

          if (item.onClick) {
            return (
              <button
                key={item.name}
                type="button"
                className={classes}
                onClick={item.onClick}
              >
                {iconWithBadge}
                <span>{item.name}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href!}
              className={classes}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {iconWithBadge}
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
