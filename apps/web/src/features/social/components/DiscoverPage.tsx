import Link from 'next/link'
import { useQuery } from '@apollo/client'
import { NextSeo } from 'next-seo'
import { FaRegHeart } from 'react-icons/fa'
import { Container } from '@/components/layout/Container'
import { TitleWithLine } from '@/components/label/TitleWithLine'
import { useCachedSession } from '@/hooks/useCachedSession'
import { NO_IMAGE } from '@/libs/constants'
import {
  popularBooksQuery,
  topReadersQuery,
  myLikedBookIdsQuery,
  feedQuery,
} from '../api'
import { LikeButton } from './LikeButton'

interface PopularBook {
  id: string
  title: string
  author: string
  image: string
  username: string
  userImage?: string
  sheet: string
  likeCount: number
}

interface TopReader {
  name: string
  image?: string
  bookCount: number
}

interface FeedBook {
  id: string
  title: string
  author: string
  memo: string
  image: string
  username: string
  userImage?: string
  sheet: string
  likeCount: number
}

export const DiscoverPage: React.FC = () => {
  const { session, status } = useCachedSession()
  const isAuthed = status === 'authenticated'
  const currentUsername = session?.user?.name ?? null

  const { data: popularData } = useQuery(popularBooksQuery, {
    variables: { limit: 12 },
  })
  const { data: readersData } = useQuery(topReadersQuery, {
    variables: { limit: 10 },
  })
  const { data: likedData } = useQuery(myLikedBookIdsQuery, {
    skip: !isAuthed,
  })
  const { data: feedData } = useQuery(feedQuery, {
    variables: { input: { limit: 12, offset: 0 } },
    skip: !isAuthed,
  })

  const likedSet = new Set<number>(likedData?.myLikedBookIds ?? [])
  const popular: PopularBook[] = popularData?.popularBooks ?? []
  const readers: TopReader[] = readersData?.topReaders ?? []
  const feed: FeedBook[] = feedData?.feed?.books ?? []

  return (
    <Container className="mb-16">
      <NextSeo
        title="発見 | kidoku"
        description="今週読まれている本や読了数ランキングから、新しい本と読書家に出会おう。"
      />

      <h1 className="mb-8 mt-6 text-center text-2xl font-bold">発見</h1>

      {isAuthed && feed.length > 0 && (
        <section className="mb-12">
          <TitleWithLine text="フォロー中の新着" className="mb-4" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {feed.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                image={book.image}
                username={book.username}
                sheet={book.sheet}
                likeCount={book.likeCount}
                liked={likedSet.has(Number(book.id))}
                isMine={!!currentUsername && book.username === currentUsername}
              />
            ))}
          </div>
        </section>
      )}

      <section className="mb-12">
        <TitleWithLine text="今週読まれている本" className="mb-4" />
        {popular.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            まだいいねされた本がありません。
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {popular.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                image={book.image}
                username={book.username}
                sheet={book.sheet}
                likeCount={book.likeCount}
                liked={likedSet.has(Number(book.id))}
                isMine={!!currentUsername && book.username === currentUsername}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <TitleWithLine text="読了数ランキング" className="mb-4" />
        {readers.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            まだランキングがありません。
          </p>
        ) : (
          <ol className="mx-auto max-w-md">
            {readers.map((reader, i) => (
              <li
                key={reader.name}
                className="flex items-center gap-3 border-b border-gray-100 py-3"
              >
                <span className="w-6 text-center text-lg font-bold text-gray-400">
                  {i + 1}
                </span>
                <img
                  src={reader.image || NO_IMAGE}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
                <Link
                  href={`/${reader.name}/sheets`}
                  className="flex-1 font-bold hover:underline"
                >
                  {reader.name}
                </Link>
                <span className="text-sm text-gray-500">
                  {reader.bookCount}冊
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Container>
  )
}

interface BookCardProps {
  id: string
  title: string
  image: string
  username: string
  sheet: string
  likeCount: number
  liked: boolean
  /** 自分の本かどうか（自分の本にはいいねボタンを表示しない） */
  isMine?: boolean
}

const BookCard: React.FC<BookCardProps> = ({
  id,
  title,
  image,
  username,
  sheet,
  likeCount,
  liked,
  isMine = false,
}) => (
  <div className="flex flex-col">
    <Link href={`/books/${id}`} className="mb-2">
      <img
        src={image || NO_IMAGE}
        alt={title}
        className="mx-auto h-[160px] object-contain drop-shadow"
        loading="lazy"
      />
    </Link>
    <div className="line-clamp-2 text-xs font-bold">{title}</div>
    <div className="mt-1 flex items-center justify-between">
      <Link
        href={`/${username}/sheets/${sheet}`}
        className="truncate text-xs text-gray-500 hover:underline"
      >
        {username}
      </Link>
      {isMine ? (
        <span className="flex items-center gap-1 text-sm text-gray-400">
          <FaRegHeart size={16} />
          <span className="tabular-nums">{likeCount}</span>
        </span>
      ) : (
        <LikeButton bookId={id} count={likeCount} liked={liked} size={16} />
      )}
    </div>
  </div>
)
