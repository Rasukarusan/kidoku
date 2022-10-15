import { atom } from 'recoil'
import { SelectItems } from '@/features/index/types'

export const selectItemsAtom = atom<SelectItems>({
  key: 'selectItemsAtom',
  default: {},
})
