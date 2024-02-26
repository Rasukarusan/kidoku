import { useEffect, useState } from 'react'
import { kosugi, notojp } from '@/libs/fonts'
import { AddModal } from '@/components/input/SearchBox/AddModal'
import { io } from 'socket.io-client'
import { EventType } from '@/types/event_queue'
import { useAtom } from 'jotai'
import { socketAtom } from '@/store/socket'

interface Props {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  const [open, setOpen] = useState(false)
  const [book, setBook] = useState(null)
  const [socket, setSocket] = useAtom(socketAtom)
  useEffect(() => {
    fetch('/api/socket').then((res) => {
      const socket = io()
      socket.on('connect', () => {
        console.log('connected!!!')
      })
      // サーバーからメッセージ受信時
      socket.on('message', (message) => {
        console.log('new message!', JSON.parse(message))
        setBook(JSON.parse(message.message))
        setOpen(true)
      })
      setSocket(socket)
    })
  }, [])

  const sendMessage = () => {
    if (!socket) return
    console.log('send')
    const message = {
      event: EventType.AddBook,
      message: { title: 'hoge', image: 'http://foo.png' },
    }
    socket.send(JSON.stringify(message))
  }
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
