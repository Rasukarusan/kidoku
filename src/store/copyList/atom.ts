import { atom } from 'recoil'
import { CopyList } from '@/features/index/types'

export const copyListAtom = atom<CopyList>({
  key: 'copyListAtom',
  default: {},
})
