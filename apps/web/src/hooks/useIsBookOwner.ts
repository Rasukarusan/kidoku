import { useSession } from 'next-auth/react'
import { Book } from '@/types/book'

export function useIsBookOwner(book: Book | null | undefined): boolean {
  const { data: session } = useSession()
  return !!book && session?.user?.id === book.userId
}
