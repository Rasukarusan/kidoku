import { Container } from '@/components/layout/Container'
import { BookComment, Comment } from '@/components/layout/BookComment'
import Link from 'next/link'

interface Props {
  comments: Comment[]
}

export const IndexPage: React.FC<Props> = ({ comments }) => {
  return (
    <Container className="p-6">
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
