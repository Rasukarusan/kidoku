import { useCachedSession } from '@/hooks/useCachedSession'

/** Compatibility hook for navigation to the canonical collection workspace. */
export function useReadingRecordsUrl(): string {
  const { session } = useCachedSession()
  return session?.user.name
    ? `/${encodeURIComponent(session.user.name)}/collections`
    : '/'
}
