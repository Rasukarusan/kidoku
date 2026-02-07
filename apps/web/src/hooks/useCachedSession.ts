import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import type { Session } from 'next-auth'

const STORAGE_KEY = 'kidoku:session-cache'

type CachedSessionData = {
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
    admin: boolean
  }
}

export function saveSessionToCache(session: Session) {
  try {
    const data: CachedSessionData = {
      user: {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email ?? null,
        image: session.user.image ?? null,
        admin: session.user.admin,
      },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage が使えない環境では無視
  }
}

export function clearSessionCache() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // localStorage が使えない環境では無視
  }
}

function loadSessionFromCache(): CachedSessionData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CachedSessionData
  } catch {
    return null
  }
}

/**
 * useSession のラッパー。
 * NextAuth のセッション取得中（status === 'loading'）の間、
 * localStorage にキャッシュされたセッション情報を返すことで
 * 初回アクセス時のちらつきを解消する。
 */
export function useCachedSession() {
  const { data: session, status } = useSession()
  const [cachedSession, setCachedSession] = useState<CachedSessionData | null>(
    null
  )

  // マウント時にキャッシュを読み込む
  useEffect(() => {
    setCachedSession(loadSessionFromCache())
  }, [])

  // 認証完了時にキャッシュを更新
  useEffect(() => {
    if (status === 'authenticated' && session) {
      saveSessionToCache(session)
    }
    if (status === 'unauthenticated') {
      clearSessionCache()
    }
  }, [status, session])

  // loading中はキャッシュを返す
  if (status === 'loading' && cachedSession) {
    return {
      session: cachedSession as unknown as Session,
      status: 'authenticated' as const,
      isFromCache: true,
    }
  }

  return {
    session,
    status,
    isFromCache: false,
  }
}
