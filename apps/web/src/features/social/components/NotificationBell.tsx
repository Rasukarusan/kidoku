import Link from 'next/link'
import { useQuery } from '@apollo/client'
import { AiOutlineBell } from 'react-icons/ai'
import { useCachedSession } from '@/hooks/useCachedSession'
import { unreadNotificationCountQuery } from '../api'

/**
 * ヘッダー用の通知ベル。未読件数バッジ付き。
 * ログイン時のみ表示し、/notifications へ遷移する。
 */
export const NotificationBell: React.FC = () => {
  const { status } = useCachedSession()
  const { data } = useQuery(unreadNotificationCountQuery, {
    skip: status !== 'authenticated',
    pollInterval: 60000,
  })

  if (status !== 'authenticated') return null

  const unread: number = data?.unreadNotificationCount ?? 0

  return (
    <Link
      href="/notifications"
      aria-label={unread > 0 ? `お知らせ（未読${unread}件）` : 'お知らせ'}
      className="relative flex-shrink-0 p-1 text-gray-700 transition-colors hover:text-gray-900"
    >
      <AiOutlineBell className="h-7 w-7" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex min-w-[16px] items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold leading-4 text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  )
}
