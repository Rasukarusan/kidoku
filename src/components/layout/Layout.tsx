import pusher from '@/libs/pusher/client'
import { useEffect, useState } from 'react'
import { kosugi, notojp } from '@/libs/fonts'
import { AddModal } from '@/components/input/SearchBox/AddModal'
import { EventType } from '@/types/event_queue'
import { useSession } from 'next-auth/react'
import { pusherAtom } from '@/store/pusher/atom'
import { useSetAtom } from 'jotai'

interface Props {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [book, setBook] = useState(null)
  const { data: session } = useSession()
  const setPusher = useSetAtom(pusherAtom)
  useEffect(() => {
    if (!session) return
    const channelName = session.user.id
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
    setPusher(pusher)
  }, [session])

  return (
    <div className={`${kosugi.variable} ${notojp.variable}`}>
      <AddModal
        open={open}
        item={book}
        onClose={() => {
          setOpen(false)
        }}
      />
      {children}
    </div>
  )
}
