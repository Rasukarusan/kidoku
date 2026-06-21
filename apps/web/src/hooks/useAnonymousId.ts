import { useEffect, useState } from 'react'
import { getOrCreateAnonymousId } from '@/libs/anonymousId'

/**
 * 未ログインユーザーの匿名ID（Cookie由来）を返すフック。
 * SSR とのハイドレーション不整合を避けるため、マウント後に値を確定する。
 * 確定前は null を返す。
 */
export function useAnonymousId(): string | null {
  const [anonymousId, setAnonymousId] = useState<string | null>(null)

  useEffect(() => {
    setAnonymousId(getOrCreateAnonymousId())
  }, [])

  return anonymousId
}
