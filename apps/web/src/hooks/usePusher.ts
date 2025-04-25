import pusher from '@/libs/pusher/client'
import { useEffect } from 'react'
import { EventType } from '@/types/event_queue'
import { useSession } from 'next-auth/react'
import { pusherAtom, pusherConnectionAtom } from '@/store/pusher/atom'
import { useAtom, useSetAtom } from 'jotai'
import { getChannelName } from '@/libs/pusher/util'
import { openAddModalAtom } from '@/store/modal/atom'
import { addBookAtom } from '@/store/book/atom'

export const usePusher = () => {
  const { data: session } = useSession()
  const setOpen = useSetAtom(openAddModalAtom)
  const setBook = useSetAtom(addBookAtom)
  const [globalPusher, setGlobalPusher] = useAtom(pusherAtom)
  const setPusherConnection = useSetAtom(pusherConnectionAtom)
  useEffect(() => {
    if (!session) return
    if (globalPusher) return
    const channelName = getChannelName(session.user.id)
    const eventName = EventType.AddBook
    const channel = pusher.subscribe(channelName)
    channel.bind(eventName, function (data) {
      const { userId, event, sentFromMobile, book } = data
      if (
        userId === session.user.id &&
        sentFromMobile &&
        event === EventType.AddBook
      ) {
        setBook(book)
        setOpen(true)
      }
    })
    pusher.connection.bind('state_change', function (states) {
      setPusherConnection(states.current)
    })
    setGlobalPusher(pusher)
    setPusherConnection(pusher.connection.state)
  }, [session])
}
