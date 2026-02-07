import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import {
  saveSessionToCache,
  clearSessionCache,
  saveSheetsToCache,
} from '@/hooks/useCachedSession'
import { useQuery } from '@apollo/client'
import { getSheetsQuery } from '@/features/sheet/api'

/**
 * セッション情報とシートデータを localStorage にキャッシュする。
 * 次回アクセス時にキャッシュから即座に復元し、
 * 認証・データ取得完了までのちらつきを解消する。
 */
export const StoreAccessToken = () => {
  const { data: session, status } = useSession()
  const { data: sheetsData } = useQuery(getSheetsQuery)

  useEffect(() => {
    if (status === 'authenticated' && session) {
      saveSessionToCache(session)
    }
    if (status === 'unauthenticated') {
      clearSessionCache()
    }
  }, [status, session])

  useEffect(() => {
    if (sheetsData?.sheets && sheetsData.sheets.length > 0) {
      saveSheetsToCache(
        sheetsData.sheets.map((s: { id: number; name: string }) => ({
          id: s.id,
          name: s.name,
        }))
      )
    }
  }, [sheetsData])

  return <></>
}
