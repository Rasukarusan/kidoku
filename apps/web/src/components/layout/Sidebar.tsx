import React, { useEffect, useRef, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAtom } from 'jotai'
import { openNavSidebarAtom } from '@/store/modal/atom'
import {
  AiOutlineHome,
  AiOutlineBook,
  AiOutlineSetting,
  AiOutlineClose,
} from 'react-icons/ai'
import { BiExit } from 'react-icons/bi'
import { signOut } from 'next-auth/react'
import { useQuery } from '@apollo/client'
import { getSheetsQuery } from '@/features/sheet/api'
import { Logo } from '@/components/icon/Logo'

export const Sidebar: React.FC = () => {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useAtom(openNavSidebarAtom)
  const { data } = useQuery(getSheetsQuery)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // ESCキーでサイドバーを閉じる
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    },
    [isOpen, setIsOpen]
  )

  // モバイルサイドバーが開いたときの処理
  useEffect(() => {
    if (isOpen) {
      // フォーカスを閉じるボタンに移動
      setTimeout(() => {
        closeButtonRef.current?.focus()
      }, 100)

      // body のスクロールを無効化
      document.body.style.overflow = 'hidden'

      // ESCキーリスナーを追加
      document.addEventListener('keydown', handleKeyDown)
    } else {
      // body のスクロールを有効化
      document.body.style.overflow = 'unset'

      // ESCキーリスナーを削除
      document.removeEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  // サイドバーを閉じる関数
  const closeSidebar = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  // キーボードナビゲーション（Tab循環）
  const handleSidebarKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      const focusableElements = sidebarRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>

      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement.focus()
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement.focus()
          }
        }
      }
    }
  }, [])

  // ナビゲーションアイテムのメモ化
  const navigationItems = useMemo(() => {
    const sheets = data?.sheets || []
    const defaultUrl = !session
      ? '/'
      : sheets.length > 0
        ? `/${session.user.name}/sheets/${sheets[0].name}`
        : `/${session.user.name}/sheets/total`

    // 現在のパスに基づいてアクティブ状態を判定
    const isHomePage = router.pathname === '/'
    const isSheetsPage =
      router.pathname.includes('/sheets') && !router.pathname.includes('/total')
    const isSettingsPage = router.pathname.includes('/settings')

    return [
      {
        name: 'ホーム',
        href: '/',
        icon: AiOutlineHome,
        isActive: isHomePage,
      },
      {
        name: '読書記録',
        href: defaultUrl,
        icon: AiOutlineBook,
        isActive: isSheetsPage,
      },
      {
        name: '設定',
        href: '/settings/profile',
        icon: AiOutlineSetting,
        isActive: isSettingsPage,
      },
    ]
  }, [data, session, router.pathname])

  // 認証状態を判定
  const isAuthenticated = status === 'authenticated' && session

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: '100%',
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 30,
      },
    },
  }

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  }

  return (
    <>
      {/* Sidebar Overlay (トグル式) */}
      <AnimatePresence>
        {isOpen && isAuthenticated && (
          <>
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={overlayVariants}
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
              onClick={closeSidebar}
              aria-hidden="true"
            />

            <motion.div
              ref={sidebarRef}
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className="fixed inset-y-0 right-0 z-50 w-64 bg-main shadow-xl focus:outline-none"
              id="mobile-sidebar"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sidebar-title"
              onKeyDown={handleSidebarKeyDown}
            >
              <div className="flex h-full flex-col">
                {/* Header with close button */}
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <Link
                    href="/"
                    className="flex items-center gap-3 no-underline"
                    onClick={closeSidebar}
                  >
                    <Logo className="h-8 w-8" />
                    <h1
                      id="sidebar-title"
                      className="text-xl font-bold text-gray-800"
                    >
                      Kidoku
                    </h1>
                  </Link>
                  <button
                    ref={closeButtonRef}
                    onClick={closeSidebar}
                    className="rounded-md p-2 text-gray-400 transition-colors duration-150 hover:bg-white/50 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="メニューを閉じる"
                  >
                    <AiOutlineClose className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav
                  className="flex-1 space-y-1 px-3 py-6"
                  role="navigation"
                  aria-label="メインメニュー"
                >
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeSidebar}
                        className={`group flex items-center rounded-lg px-3 py-3 text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-main ${
                          item.isActive
                            ? 'border border-gray-100 bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                        }`}
                        aria-current={item.isActive ? 'page' : undefined}
                      >
                        <Icon
                          className={`mr-4 h-6 w-6 flex-shrink-0 ${
                            item.isActive
                              ? 'text-gray-700'
                              : 'text-gray-400 group-hover:text-gray-600'
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>

                {/* User section at bottom */}
                <div
                  className="flex flex-shrink-0 border-t border-gray-100 p-4"
                  role="region"
                  aria-label="ユーザーアカウント"
                >
                  <div className="w-full space-y-3">
                    <Link
                      href="/settings/profile"
                      onClick={closeSidebar}
                      className="flex items-center rounded-lg p-2 transition-colors duration-150 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-main"
                      aria-label="アカウント設定に移動"
                    >
                      <div className="mr-3">
                        <img
                          className="h-10 w-10 rounded-full ring-2 ring-white"
                          src={session.user.image || ''}
                          alt={`${session.user.name || 'ユーザー'}のプロフィール画像`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {session.user.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {session.user.email}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        closeSidebar()
                      }}
                      className="flex w-full items-center rounded-lg px-3 py-3 text-base font-medium text-gray-600 transition-all duration-200 hover:bg-white/50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-main"
                      aria-label="アカウントからログアウト"
                    >
                      <BiExit
                        className="mr-4 h-6 w-6 flex-shrink-0 text-gray-400"
                        aria-hidden="true"
                      />
                      ログアウト
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
