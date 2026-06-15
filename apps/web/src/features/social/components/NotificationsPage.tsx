import { useEffect } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from '@apollo/client'
import { NextSeo } from 'next-seo'
import { FaHeart, FaUserPlus } from 'react-icons/fa'
import { Container } from '@/components/layout/Container'
import { useCachedSession } from '@/hooks/useCachedSession'
import { getLastModified } from '@/utils/string'
import { NO_IMAGE } from '@/libs/constants'
import {
  notificationsQuery,
  unreadNotificationCountQuery,
  markNotificationsReadMutation,
} from '../api'

interface NotificationItem {
  id: string
  type: string
  bookId?: number
  read: boolean
  created: string
  actorName: string
  actorImage?: string
  bookTitle?: string
}

export const NotificationsPage: React.FC = () => {
  const { status } = useCachedSession()
  const isAuthed = status === 'authenticated'

  const { data } = useQuery(notificationsQuery, {
    variables: { input: { limit: 30, offset: 0 } },
    skip: !isAuthed,
  })
  const [markRead] = useMutation(markNotificationsReadMutation, {
    refetchQueries: [{ query: unreadNotificationCountQuery }],
  })

  // 一覧を開いたら既読化する
  const hasNotifications = !!data?.notifications
  useEffect(() => {
    if (isAuthed && hasNotifications) {
      markRead().catch(() => undefined)
    }
  }, [isAuthed, hasNotifications, markRead])

  const items: NotificationItem[] = data?.notifications?.notifications ?? []

  return (
    <Container className="mb-16">
      <NextSeo title="お知らせ | kidoku" noindex />
      <h1 className="mb-6 mt-6 text-center text-2xl font-bold">お知らせ</h1>

      {!isAuthed ? (
        <p className="py-12 text-center text-sm text-gray-400">
          ログインするとお知らせが表示されます。
        </p>
      ) : items.length === 0 ? (
        <p className="py-12 text-center text-sm text-gray-400">
          まだお知らせはありません。
        </p>
      ) : (
        <ul className="mx-auto max-w-xl">
          {items.map((n) => (
            <NotificationRow key={n.id} item={n} />
          ))}
        </ul>
      )}
    </Container>
  )
}

const NotificationRow: React.FC<{ item: NotificationItem }> = ({ item }) => {
  const isFollow = item.type === 'follow'
  const href =
    isFollow || !item.bookId
      ? `/${item.actorName}/sheets`
      : `/books/${item.bookId}`

  return (
    <li
      className={`flex items-center gap-3 border-b border-gray-100 px-2 py-3 ${
        item.read ? '' : 'bg-blue-50/50'
      }`}
    >
      <div className="relative">
        <img
          src={item.actorImage || NO_IMAGE}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
        <span
          className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-white ${
            isFollow ? 'bg-gray-700' : 'bg-pink-500'
          }`}
        >
          {isFollow ? <FaUserPlus size={10} /> : <FaHeart size={10} />}
        </span>
      </div>
      <Link href={href} className="flex-1 text-sm hover:underline">
        <span className="font-bold">{item.actorName}</span>
        {isFollow ? (
          'さんがあなたをフォローしました'
        ) : (
          <>
            さんが「<span className="font-bold">{item.bookTitle}</span>
            」にいいねしました
          </>
        )}
      </Link>
      <span className="whitespace-nowrap text-xs text-gray-400">
        {getLastModified(item.created)}
      </span>
    </li>
  )
}
