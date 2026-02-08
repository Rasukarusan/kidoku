import { useQuery } from '@apollo/client'
import { getSheetsQuery } from '@/features/sheet/api'
import { useCachedSession, loadSheetsFromCache } from '@/hooks/useCachedSession'

/**
 * 読書記録ページへのURLを返すフック。
 * セッションとシートデータ（キャッシュ含む）から動的にURLを構築する。
 */
export function useReadingRecordsUrl(): string {
  const { session } = useCachedSession()
  const { data } = useQuery(getSheetsQuery)
  const sheets = data?.sheets || loadSheetsFromCache() || []

  if (!session) return '/'

  return sheets.length > 0
    ? `/${session.user.name}/sheets/${sheets[0].name}`
    : `/${session.user.name}/sheets/total`
}
