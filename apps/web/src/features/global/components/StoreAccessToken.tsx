import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { saveSessionToCache, clearSessionCache } from '@/hooks/useCachedSession'

/**
 * セッション情報を localStorage にキャッシュする。
 * 次回アクセス時にキャッシュからセッションを即座に復元し、
 * 認証完了までのちらつきを解消する。
 */
export const StoreAccessToken = () => {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session) {
      saveSessionToCache(session)
    }
    if (status === 'unauthenticated') {
      clearSessionCache()
    }
  }, [status, session])

  return <></>
}
