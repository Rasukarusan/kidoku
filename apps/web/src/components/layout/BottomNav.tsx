import React, { useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  AiOutlineHome,
  AiFillHome,
  AiOutlineBook,
  AiFillBook,
  AiOutlineSetting,
  AiFillSetting,
  AiOutlinePlusCircle,
} from 'react-icons/ai'
import { useSetAtom } from 'jotai'
import { useCachedSession } from '@/hooks/useCachedSession'
import { useReadingRecordsUrl } from '@/hooks/useReadingRecordsUrl'
import { openSearchModalAtom } from '@/store/modal/atom'

export const BottomNav: React.FC = () => {
  const router = useRouter()
  const { session, status } = useCachedSession()
  const readingRecordsUrl = useReadingRecordsUrl()
  const setOpenSearchModal = useSetAtom(openSearchModalAtom)

  const handleOpenSearchModal = useCallback(() => {
    setOpenSearchModal(true)
  }, [setOpenSearchModal])

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
        name: '設定',
        href: '/settings/profile',
        icon: AiOutlineSetting,
        activeIcon: AiFillSetting,
        isActive: isSettingsPage,
      },
    ]
  }, [readingRecordsUrl, router.pathname])

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
        {navigationItems.map((item, index) => {
          const Icon = item.isActive ? item.activeIcon : item.icon
          return (
            <React.Fragment key={item.name}>
              {index === 2 && (
                <button
                  type="button"
                  onClick={handleOpenSearchModal}
                  className="flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
                  aria-label="本を登録"
                >
                  <AiOutlinePlusCircle className="h-5 w-5" aria-hidden="true" />
                  <span>本を登録</span>
                </button>
              )}
              <Link
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-xs transition-colors ${
                  item.isActive
                    ? 'font-semibold text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-current={item.isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{item.name}</span>
              </Link>
            </React.Fragment>
          )
        })}
      </div>
    </nav>
  )
}
