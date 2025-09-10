import { useAtom, useSetAtom } from 'jotai'
import { SearchResult } from '@/types/search'
import { useEffect, useState } from 'react'
// import { items } from './mock'
import { useSession } from 'next-auth/react'
import { searchBooks } from '@/utils/search'
import { openAddModalAtom, openLoginModalAtom } from '@/store/modal/atom'
import { addBookAtom } from '@/store/book/atom'

interface Props {
  input: string
  onClose: () => void
}

export const Books: React.FC<Props> = ({ input }) => {
  const setOpenLoginModal = useSetAtom(openLoginModalAtom)
  const setOpenAddModal = useSetAtom(openAddModalAtom)
  const [selectItem, setSelectItem] = useAtom(addBookAtom)
  const [books, setBooks] = useState<SearchResult[]>([])
  // const [books, setBooks] = useState<SearchResult[]>(items)
  const { data: session, status } = useSession()

  // デバウンス。入力から一定時間経った後に検索を実行する。
  // 300ms以内に入力があった場合はタイマーがクリアされ、新しいタイマーが設定され、デバウンスが実現される。
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!input) {
        setBooks([])
        return
      }
      const items = await searchBooks(input)
      setBooks(items ?? [])
    }, 300)
    return () => clearTimeout(timer)
  }, [input])

  return (
    <>
      <div className="grid grid-cols-2 items-center justify-center gap-8 p-2 text-gray-900 sm:grid-cols-3 sm:p-4">
        {books.map((item: SearchResult, i: number) => {
          const { title, author, image } = item
          return (
            <div
              className="relative mx-auto w-[156px] cursor-pointer px-2 py-2 text-center hover:brightness-95 "
              key={`${i}-${item.id}`}
              onMouseEnter={() => setSelectItem(item)}
            >
              <div className="mb-2">
                <img
                  className="mx-auto mb-2 h-[150px] object-contain"
                  src={image}
                  alt={title}
                  loading="lazy"
                />
                <div className="truncate text-sm font-bold">{title}</div>
                <div className="truncate text-xs text-gray-400">{author}</div>
                {selectItem?.id === item.id && (
                  <div className="absolute bottom-0 left-1/2 w-full -translate-x-2/4 text-center opacity-80 hover:opacity-100">
                    <button
                      className="w-full rounded-md bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:bg-gray-500"
                      onClick={() => {
                        // セッションローディング中は何もしない
                        if (status === 'loading') {
                          return
                        }

                        // 未認証の場合はログインモーダルを表示
                        if (status === 'unauthenticated') {
                          setOpenLoginModal(true)
                          return
                        }

                        // 認証済みの場合のみ本追加モーダルを表示
                        setOpenAddModal(true)
                      }}
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? '読み込み中...' : '本を登録する'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
