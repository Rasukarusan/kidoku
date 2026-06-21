import { useQuery } from '@apollo/client'
import { useCachedSession } from '@/hooks/useCachedSession'
import { unreadNotificationCountQuery } from '../api'

/**
 * 未読通知件数を取得するフック。
 * 認証済みの場合のみポーリングで件数を取得する。
 */
export const useUnreadNotificationCount = (): number => {
  const { status } = useCachedSession()
  const { data } = useQuery(unreadNotificationCountQuery, {
    skip: status !== 'authenticated',
    pollInterval: 60000,
  })

  if (status !== 'authenticated') return 0

  return data?.unreadNotificationCount ?? 0
}
