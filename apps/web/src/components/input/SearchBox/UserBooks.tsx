import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { SearchResult } from '@/types/search'
import { truncate } from '@/utils/string'
import { searchUserBooks } from '@/utils/search'
import Link from 'next/link'
import { Loading } from '@/components/icon/Loading'
// import { userBooks } from './mock'

interface Props {
  input: string
  onClose: () => void
}

export const UserBooks: React.FC<Props> = ({ input, onClose }) => {
  const router = useRouter()
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
                  <button
                    className="mr-2 w-[64px] min-w-[64px] sm:mr-0 sm:w-full sm:p-2"
                    onClick={() => {
                      // pushによる遷移だと遷移後のモーダルが表示されないためlocationで遷移
                      location.href = `/${username}/sheets/${sheet}?book=${id}`
                    }}
                  >
                    <img
                      className="mx-auto min-w-[64px] object-contain sm:h-[100px]"
                      src={image}
                      alt={title}
                      loading="lazy"
                    />
                  </button>
                  <div>
                    <div
                      className="mb-1 text-sm font-bold"
                      dangerouslySetInnerHTML={{ __html: title }}
                    ></div>
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
