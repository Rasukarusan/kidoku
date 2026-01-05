import Link from 'next/link'
import { getLastModified, truncate, mask } from '@/utils/string'

export interface Comment {
  id: string
  title: string
  memo: string
  image: string
  updated: string
  username: string
  userImage: string
  sheet: string
}

interface Props {
  comment: Comment
}

export const BookComment: React.FC<Props> = ({ comment }) => {
  const { memo, image, username, userImage, sheet } = comment
  return (
    <div className="flex items-center p-4">
      <div className="pr-4 text-center">
        <Link href={`/${username}/sheets/${sheet}?book=${comment.id}`}>
          <img className="mb-1 w-[82px] min-w-[82px]" src={image} alt="" />
        </Link>
      </div>
      <div>
        <Link
          href={`/${username}/sheets/${sheet}?book=${comment.id}`}
          className="mb-2 inline-block text-xs font-bold sm:text-sm"
        >
          {truncate(mask(memo), 120)}
        </Link>
        <div className="flex items-center text-xs text-gray-500 sm:text-sm ">
          <img className="mr-2 h-8 w-8 rounded-full" src={userImage} alt="" />
          <div>
            <Link
              className="hover:underline"
              href={`/${username}/sheets/${sheet}`}
            >
              {username}
            </Link>
            <div className="">{getLastModified(comment.updated)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
