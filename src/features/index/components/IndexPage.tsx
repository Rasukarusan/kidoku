import { Container } from '@/components/layout/Container'
import { BookComment, Comment } from '@/components/layout/BookComment'
import Link from 'next/link'
import { useChat } from 'ai/react'
import { io } from 'socket.io-client'
import { useEffect, useState } from 'react'
import { EventType } from '@/types/event_queue'

interface Props {
  comments: Comment[]
}

export const IndexPage = ({ comments }) => {
  const { messages, input, setInput, handleInputChange, handleSubmit } =
    useChat({
      api: '/api/batch/chatgpt',
    })

  const [socket, setSocket] = useState(null)
  useEffect(() => {
    fetch('/api/socket').then((res) => res.json())
    const socket = io()
    socket.on('connect', () => {
      console.log('connected!!!')
    })
    // サーバーからメッセージ受信時
    socket.on('message', (message) => {
      console.log('new message!', JSON.parse(message))
    })
    setSocket(socket)
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
    <Container className="p-6">
      <button
        onClick={async () => {
          sendMessage()
        }}
        className="rounded-md bg-green-100 px-2 py-1"
      >
        Send
      </button>
      {process.env.NEXT_PUBLIC_FLAG_KIDOKU_2 === 'true' && (
        <div className="stretch mx-auto flex w-full max-w-md flex-col py-24">
          {messages.map((m) => (
            <div key={m.id}>
              {m.role === 'user' ? 'User: ' : 'AI: '}
              {m.content}
            </div>
          ))}

          <form onSubmit={handleSubmit}>
            <label>Say something...</label>
            <button type="submit" onClick={() => setInput('h')}>
              Send
            </button>
          </form>
        </div>
      )}
      <section>
        <div className="flex items-center">
          <h2 className="p-2 text-2xl font-bold">Comments</h2>
        </div>
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {comments.map((comment) => (
            <BookComment key={comment.id} comment={comment} />
          ))}
        </div>
        <div className="text-center">
          <Link href="/comments/1" className="text-blue-500 hover:underline">
            さらに表示
          </Link>
        </div>
      </section>
    </Container>
  )
}
