import { Container } from '@/components/layout/Container'
import Link from 'next/link'
import { truncate } from '@/utils/string'
import dayjs from 'dayjs'

interface Props {
  comments: CommentProps
}
interface CommentProps {
  title: string
  memo: string
  image: string
  updated: string
  username: string
  userImage: string
}
export const Comment: React.FC<{ comment: CommentProps }> = ({ comment }) => {
  const { title, memo, image, username, userImage } = comment
  const updated = dayjs().diff(dayjs(comment.updated), 'day', false) + '日前'
  return (
    <div className="flex items-center p-4">
      <div className="pr-4  text-center">
        <img className="mb-1 w-[82px] min-w-[82px]" src={image} alt="" />
      </div>
      <div>
        <div className="mb-2 text-xs font-bold text-gray-600 sm:text-sm">
          {truncate(memo, 120)}
        </div>
        <div className="flex items-center text-xs text-gray-500 sm:text-sm ">
          <img className="mr-2 h-8 w-8 rounded-full" src={userImage} alt="" />
          <div>
            <Link className="hover:underline" href={`/${username}/sheets`}>
              {username}
            </Link>
            <div className="">{updated}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const IndexPage = ({ comments }) => {
  return (
    <Container className="p-6">
      <section>
        <h2 className="p-2 text-2xl font-bold">Comments</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      </section>
    </Container>
  )
}
