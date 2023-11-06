import { atom } from 'recoil'
import { SelectItems } from './types'

export const selectItemsAtom = atom<SelectItems>({
  key: 'selectItemsAtom',
  default: [],
})
