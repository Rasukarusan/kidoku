import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { useSetAtom } from 'jotai'
import { SearchResult } from '@/types/search'
import { truncate, stripTags } from '@/utils/string'
import { searchUserBooks } from '@/utils/search'
import { openLoginModalAtom } from '@/store/modal/atom'
import Link from 'next/link'
import { Loading } from '@/components/icon/Loading'
// import { userBooks } from './mock'

interface Props {
  input: string
  onClose: () => void
  onSelectBook: (book: SearchResult) => void
}

export const UserBooks: React.FC<Props> = ({
  input,
  onClose,
  onSelectBook,
}) => {
  const router = useRouter()
  const { data: session } = useSession()
  const setOpenLoginModal = useSetAtom(openLoginModalAtom)
  const [books, setBooks] = useState<SearchResult[]>([])
  // const [books, setBooks] = useState<SearchResult[]>(userBooks)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // デバウンス。入力から一定時間経った後に検索を実行する。
  // 300ms以内に入力があった場合はタイマーがクリアされ、新しいタイマーが設定され、デバウンスが実現される。
  useEffect(() => {
    if (!input) {
      setBooks([])
      setLoading(false)
      setError('')
      return
    }

    setLoading(true)
    setError('')

    const timer = setTimeout(async () => {
      try {
        const items = await searchUserBooks(input)
        setBooks(items ?? [])
      } catch {
        setError('本棚の検索中にエラーが発生しました')
        setBooks([])
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [input])

  // 他ユーザーの本棚の検索結果を流用して登録する。
  // タイトル・著者・カテゴリ・画像はそのまま流用し、感想（メモ）は
  // 他人のものを引き継がずテンプレートから書き始められるよう空にする。
  const handleRegister = (item: SearchResult) => {
    if (!session) {
      setOpenLoginModal(true)
      return
    }
    onSelectBook({
      id: item.id,
      // 検索結果のタイトルにはハイライト用のHTMLタグが含まれるため除去する
      title: stripTags(item.title),
      author: item.author,
      category: item.category ?? '',
      image: item.image,
      memo: '',
    })
  }

  return (
    <>
      {/* ローディング */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loading className="mr-2 h-4 w-4 border-[2px]" />
          <span className="text-xs text-gray-500">検索中...</span>
        </div>
      )}

      {/* エラー */}
      {error && !loading && (
        <div className="py-4 text-center">
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      )}

      {/* 検索結果 */}
      {!loading && !error && (
        <div className="mb-4 block overflow-y-auto border-x p-2 text-gray-900 sm:flex sm:overflow-x-auto sm:overflow-y-hidden sm:p-4">
          {books.map((item: SearchResult) => {
            const {
              id,
              title,
              memo,
              author,
              image,
              username,
              userImage,
              sheet,
            } = item
            return (
              <div
                className="relative m-2 min-w-[90%] rounded-md border border-gray-300 p-4 shadow hover:bg-gray-100 sm:min-w-[180px] sm:p-2 sm:px-4"
                key={item.id}
              >
                <div className="flex sm:block">
                  <Link
                    className="mr-2 w-[64px] min-w-[64px] sm:mr-0 sm:w-full sm:p-2"
                    href={`/books/${id}`}
                    onClick={onClose}
                  >
                    <img
                      className="mx-auto min-w-[64px] object-contain sm:h-[100px]"
                      src={image}
                      alt={title}
                      loading="lazy"
                    />
                  </Link>
                  <div>
                    <Link
                      href={`/books/${id}`}
                      className="mb-1 block text-sm font-bold hover:underline"
                      dangerouslySetInnerHTML={{ __html: title }}
                      onClick={onClose}
                    ></Link>
                    <div className="text-xs">{truncate(author, 12)}</div>
                    <div
                      className="mb-2 text-xs text-gray-400"
                      dangerouslySetInnerHTML={{ __html: memo }}
                    ></div>
                    <div className="flex items-center text-xs text-gray-500 sm:text-sm ">
                      <img
                        className="mr-2 h-8 w-8 rounded-full"
                        src={userImage}
                        alt=""
                      />
                      <button
                        className="hover:underline"
                        onClick={() => {
                          onClose()
                          router.push(`/${username}/sheets/${sheet}`)
                        }}
                      >
                        {username}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  className="mt-3 w-full rounded-md bg-blue-600 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
                  onClick={() => handleRegister(item)}
                  title="この本の情報を流用して登録します（感想は引き継がれません）"
                >
                  この本を登録
                </button>
              </div>
            )
          })}
        </div>
      )}
      {!loading && !error && books.length > 0 && (
        <div className="mb-4 text-center">
          <Link
            href={`/search?q=${input}`}
            className="text-blue-500 hover:underline"
            onClick={onClose}
          >
            さらに表示
          </Link>
        </div>
      )}
    </>
  )
}
