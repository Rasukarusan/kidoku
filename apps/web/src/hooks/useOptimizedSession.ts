import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface OptimizedSession {
  data: any
  status: 'loading' | 'authenticated' | 'unauthenticated'
  isInitialLoading: boolean
  isRevalidating: boolean
}

/**
 * 認証状態を最適化して取得するフック
 * - 初回ローディング状態を区別
 * - ローカルキャッシュによる即座の状態提供
 * - コールドスタート対策
 */
export const useOptimizedSession = (): OptimizedSession => {
  const session = useSession()
  const [cachedStatus, setCachedStatus] = useState<string | null>(null)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [isRevalidating, setIsRevalidating] = useState(false)

  // 初回ロード時にlocalStorageから前回の認証状態を取得
  useEffect(() => {
    const cached = localStorage.getItem('auth_status_cache')
    if (cached) {
      setCachedStatus(cached)
    }
  }, [])

  // 認証状態が変わったらキャッシュを更新
  useEffect(() => {
    if (session.status !== 'loading') {
      localStorage.setItem('auth_status_cache', session.status)
      setCachedStatus(session.status)
      setIsInitialLoading(false)
      setIsRevalidating(false)
    } else if (!isInitialLoading) {
      // 初回ロード以降のloading状態は再検証中として扱う
      setIsRevalidating(true)
    }
  }, [session.status, isInitialLoading])

  // 優先順位: 
  // 1. 実際のセッション状態（loading以外）
  // 2. キャッシュされた状態（再検証中の場合）
  // 3. loading状態
  const optimizedStatus = 
    session.status !== 'loading' 
      ? session.status 
      : (isRevalidating && cachedStatus) 
        ? cachedStatus as any
        : 'loading'

  return {
    data: session.data,
    status: optimizedStatus,
    isInitialLoading: session.status === 'loading' && isInitialLoading,
    isRevalidating
  }
}