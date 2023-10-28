import { SearchResult } from '@/types/search'
import { truncate } from '@/utils/string'
import { useEffect, useState } from 'react'
import { AddModal } from './AddModal'
// import { items } from './mock'
import { useSession } from 'next-auth/react'
import { searchBooks } from '@/utils/search'

interface Props {
  input: string
}

export const UserBooks: React.FC<Props> = ({ input }) => {
  const [openAddModal, setOpenAddModal] = useState(false)
  const [selectItem, setSelectItem] = useState<SearchResult>(null)
  const [books, setBooks] = useState<SearchResult[]>([])
  const { data: session } = useSession()

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
      <AddModal
        open={openAddModal}
        item={selectItem}
        books={books}
        onClose={() => setOpenAddModal(false)}
      />
      <div className="flex overflow-x-auto border-x p-2 text-gray-900 sm:p-4">
        {books.map((item: SearchResult, i: number) => {
          const { id, title, memo, author, image } = item
          return (
            <div
              className="relative m-2 h-[260px] max-h-[300px] min-w-[45%] cursor-pointer rounded-md border border-gray-300 px-2 py-2 shadow hover:bg-gray-100 sm:min-w-[180px] sm:px-4"
              key={item.id}
              onMouseEnter={() => setSelectItem(item)}
            >
              <div className="mb-2 h-[220px]">
                <img
                  className="m-auto mb-2 h-[150px] object-contain"
                  src={image}
                  alt={title}
                  loading="lazy"
                />
                <div className="mb-1 text-sm font-bold sm:text-base">
                  {truncate(author, 12)}
                </div>
                <div className="text-xs">{truncate(author, 12)}</div>
                {session && selectItem?.id === item.id && (
                  <div className="absolute left-1/2 bottom-0 w-full -translate-x-2/4 text-center opacity-80 hover:opacity-100">
                    <button
                      className="w-full rounded-md bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700"
                      onClick={() => setOpenAddModal(true)}
                    >
                      本を登録する
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
