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
  AiOutlineSetting,
  AiFillSetting,
} from 'react-icons/ai'
import { useAtom } from 'jotai'
import { useCachedSession } from '@/hooks/useCachedSession'
import { useReadingRecordsUrl } from '@/hooks/useReadingRecordsUrl'
import { openSearchModalAtom } from '@/store/modal/atom'

export const BottomNav: React.FC = () => {
  const router = useRouter()
  const { session, status } = useCachedSession()
  const readingRecordsUrl = useReadingRecordsUrl()
  const [, setOpenSearchModal] = useAtom(openSearchModalAtom)

  const navigationItems = useMemo(() => {
    const isHomePage = router.pathname === '/'
    const isSheetsPage = router.pathname.includes('/sheets')
    const isSettingsPage = router.pathname.includes('/settings')

    return [
      {
        name: 'ホーム',
        href: '/',
        icon: AiOutlineHome,
        activeIcon: AiFillHome,
        isActive: isHomePage,
      },
      {
        name: '読書記録',
        href: readingRecordsUrl,
        icon: AiOutlineBook,
        activeIcon: AiFillBook,
        isActive: isSheetsPage,
      },
      {
        name: '本を登録',
        icon: AiOutlinePlusCircle,
        activeIcon: AiFillPlusCircle,
        isActive: false,
        onClick: () => setOpenSearchModal(true),
      },
      {
        name: '設定',
        href: '/settings/profile',
        icon: AiOutlineSetting,
        activeIcon: AiFillSetting,
        isActive: isSettingsPage,
      },
    ]
  }, [readingRecordsUrl, router.pathname, setOpenSearchModal])

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

          if (item.onClick) {
            return (
              <button
                key={item.name}
                type="button"
                className={classes}
                onClick={item.onClick}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
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
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
