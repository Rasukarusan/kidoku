import { atom } from 'recoil'

export const isLoginAtom = atom<boolean>({
  key: 'isLoginAtom',
  default: false,
})
