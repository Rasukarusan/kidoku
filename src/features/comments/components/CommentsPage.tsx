import { Container } from '@/components/layout/Container'
import { BookComment, Comment } from '@/components/layout/BookComment'

interface Props {
  comments: Comment[]
}

export const CommentsPage = ({ comments }) => {
  return (
    <Container className="p-6">
      <section>
        <h2 className="p-2 text-2xl font-bold">Comments</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {comments.map((comment) => (
            <BookComment key={comment.id} comment={comment} />
          ))}
        </div>
      </section>
    </Container>
  )
}
