import { useEffect, useState } from 'react'
import { kosugi, notojp } from '@/libs/fonts'
import { AddModal } from '@/components/input/SearchBox/AddModal'
import { useAtom } from 'jotai'
import { socketAtom } from '@/store/socket'
import Pusher from 'pusher-js'
import { EventType } from '@/types/event_queue'
import { useSession } from 'next-auth/react'

interface Props {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [book, setBook] = useState(null)
  const [socket, setSocket] = useAtom(socketAtom)
  const { data: session } = useSession()
  useEffect(() => {
    if (!session) return
    const channels = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    })
    const channel = channels.subscribe(session.user.id)
    channel.bind(EventType.AddBook, function (data) {
      console.log(data)
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
