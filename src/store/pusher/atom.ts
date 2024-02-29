import { atom } from 'jotai'
import Pusher from 'pusher-js'

export const pusherAtom = atom(null as unknown as Pusher)
export const pusherConnectionAtom = atom('')
