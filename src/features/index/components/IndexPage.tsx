import { Container } from '@/components/layout/Container'
import { BookComment, Comment } from '@/components/layout/BookComment'
import Link from 'next/link'
import { useChat } from 'ai/react'

interface Props {
  comments: Comment[]
}

export const IndexPage = ({ comments }) => {
  const { messages, input, setInput, handleInputChange, handleSubmit } =
    useChat({
      api: '/api/batch/chatgpt',
    })

  return (
    <Container className="p-6">
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
