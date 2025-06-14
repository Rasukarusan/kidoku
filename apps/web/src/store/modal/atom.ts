import { atom } from 'jotai'
import { Book } from '@/types/book'

export const openSearchModalAtom = atom<boolean>(false)
export const openLoginModalAtom = atom<boolean>(false)
export const openAddModalAtom = atom<boolean>(false)
export const openBookSidebarAtom = atom<boolean>(false)
export const sidebarBookAtom = atom<Book | null>(null)
