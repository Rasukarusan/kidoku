import { SearchResult } from '@/types/search'
import { truncate } from '@/utils/string'
import { useEffect, useState } from 'react'
import { AddModal } from './AddModal'
// import { items } from './mock'
import { useSession } from 'next-auth/react'
import { searchBooks } from '@/utils/search'
import { LoginModal } from '@/components/layout/LoginModal'

interface Props {
  input: string
  onClose: () => void
}

export const Books: React.FC<Props> = ({ input, onClose }) => {
  const [openLoginModal, setOpenLoginModal] = useState(false)
  const [openAddModal, setOpenAddModal] = useState(false)
  const [selectItem, setSelectItem] = useState<SearchResult>(null)
  const [books, setBooks] = useState<SearchResult[]>([])
  // const [books, setBooks] = useState<SearchResult[]>(items)
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
      <LoginModal
        open={openLoginModal}
        onClose={() => setOpenLoginModal(false)}
      />
      <AddModal
        open={openAddModal}
        item={selectItem}
        onClose={() => {
          onClose()
          setOpenAddModal(false)
        }}
      />
      <div className="flex overflow-x-auto border-x p-2 text-gray-900 sm:p-4">
        {books.map((item: SearchResult, i: number) => {
          const { id, title, memo, author, image } = item
          return (
            <div
              className="relative m-2 h-[260px] max-h-[300px] min-w-[45%] cursor-pointer rounded-md border border-gray-300 px-2 py-2 shadow hover:bg-gray-100 sm:min-w-[180px] sm:px-4"
              key={`${i}-${item.id}`}
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
                {selectItem?.id === item.id && (
                  <div className="absolute bottom-0 left-1/2 w-full -translate-x-2/4 text-center opacity-80 hover:opacity-100">
                    <button
                      className="w-full rounded-md bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700"
                      onClick={() => {
                        if (!session) {
                          setOpenLoginModal(true)
                          return
                        }
                        setOpenAddModal(true)
                      }}
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
