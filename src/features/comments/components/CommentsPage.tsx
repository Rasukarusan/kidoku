import Link from 'next/link'
import { Container } from '@/components/layout/Container'
import { BookComment, Comment } from '@/components/layout/BookComment'
import { NextSeo } from 'next-seo'

interface Props {
  page: number
  next: boolean
  comments: Comment[]
}

export const CommentsPage = ({ comments, next, page }) => {
  return (
    <Container className="p-6">
      <NextSeo title="コメント一覧 | kidoku" />
      <h2 className="p-2 text-2xl font-bold">Comments</h2>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {comments.map((comment) => (
          <BookComment key={comment.id} comment={comment} />
        ))}
      </div>
      <div className="text-center">
        {page > 1 && (
          <Link
            href={`/comments/${page - 1}`}
            className="pr-4 text-gray-400 hover:text-gray-700"
          >
            ← {page - 1} ページへ
          </Link>
        )}

        {next && (
          <Link
            href={`/comments/${page + 1}`}
            className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 shadow-md hover:bg-gray-200"
          >
            次のページへ →
          </Link>
        )}
      </div>
    </Container>
  )
}
