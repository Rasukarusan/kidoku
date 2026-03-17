import { SearchResult } from '@/types/search'
import { atom } from 'jotai'

export const addBookAtom = atom(null as unknown as SearchResult)

/** セッション中に登録した本の冊数 */
export const registeredBookCountAtom = atom<number>(0)
