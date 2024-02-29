import { Container } from '@/components/layout/Container'
import { BookComment, Comment } from '@/components/layout/BookComment'
import Link from 'next/link'
import { useChat } from 'ai/react'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { EventType } from '@/types/event_queue'
import { useAtomValue } from 'jotai'
import { pusherAtom } from '@/store/pusher/atom'

interface Props {
  comments: Comment[]
}

export const IndexPage = ({ comments }) => {
  const { messages, input, setInput, handleInputChange, handleSubmit } =
    useChat({
      api: '/api/batch/chatgpt',
    })
  const { data: session } = useSession()
  const pusher = useAtomValue(pusherAtom)

  const [open, setOpen] = useState(false)
  return (
    <Container className="p-6">
      <button
        className="mr-4 rounded-md bg-purple-200 px-2 py-1"
        onClick={async () => {
          const message = {
            userId: session.user.id,
            event: EventType.AddBook,
            book: { title: 'hoge' },
          }
          const res = await fetch('/api/pusher/trigger', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          })
        }}
      >
        send
      </button>
      <button
        className="mr-4 rounded-md bg-red-200 px-2 py-1"
        onClick={async () => {
          pusher.disconnect()
        }}
      >
        Disconnect
      </button>
      <button
        className="mr-4 rounded-md bg-green-200 px-2 py-1"
        onClick={async () => {
          console.log(pusher.connection.state)
          pusher.user.signin()
        }}
      >
        State
      </button>
      <button
        className="mr-4 rounded-md bg-blue-200 px-2 py-1"
        onClick={async () => {
          pusher.user.signin()
        }}
      >
        SignIn
      </button>
      <button
        className="mr-4 rounded-md bg-pink-200 px-2 py-1"
        onClick={async () => {
          console.log(pusher.allChannels())
          const channel = pusher.channel('presence-' + session?.user?.id)
          console.log(channel)
        }}
      >
        Members
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
