import { Item } from '@/types/search'
import { searchBooks } from '@/utils/search'
import { truncate } from '@/utils/string'
import { Modal } from '@/components/layout/Modal'
import { useEffect, useRef, useState } from 'react'
import { AddModal } from './AddModal'
// import { items } from './mock'
import { NO_IMAGE } from '@/libs/constants'
import { useSession } from 'next-auth/react'

interface Props {
  open: boolean
  onClose: () => void
}
export const SearchModal: React.FC<Props> = ({ open, onClose }) => {
  const ref = useRef<HTMLInputElement>(null)
  const [books, setBooks] = useState<Item[]>([])
  // const [books, setBooks] = useState<Item[]>(items)
  const [selectItem, setSelectItem] = useState<Item>(null)
  const [inputValue, setInputValue] = useState('')
  const [openAddModal, setOpenAddModal] = useState(false)
  const { data: session } = useSession()
  // 検索モーダル開いたら自動でinputフィールドにフォーカスする
  useEffect(() => {
    ref.current?.focus()
  }, [open])

  // デバウンス。入力から一定時間経った後に検索を実行する。
  // 300ms以内に入力があった場合はタイマーがクリアされ、新しいタイマーが設定され、デバウンスが実現される。
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!inputValue) {
        setBooks([])
        return
      }
      const items = await searchBooks(inputValue)
      setBooks(items ?? [])
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <Modal open={open} onClose={onClose} className="h-3/4 w-full sm:w-1/2">
      <AddModal
        open={openAddModal}
        item={selectItem}
        books={books}
        onClose={() => setOpenAddModal(false)}
      />
      <div className="flex shrink-0 items-center border-b border-b-[#f1f5f9] px-2 pt-2">
        <div className="relative w-full text-gray-600">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <button
              type="submit"
              className="focus:shadow-outline p-1 focus:outline-none"
            >
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="h-6 w-6"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </span>
          <input
            ref={ref}
            type="search"
            name="q"
            className="h-12 w-full appearance-none rounded-md bg-white py-2 pl-12 pr-2 text-sm text-gray-900 focus:outline-none"
            placeholder="本を追加"
            autoComplete="off"
            onChange={onChange}
          />
        </div>
      </div>
      <div className="flex h-full w-full flex-wrap justify-center overflow-y-auto p-2 text-gray-900 sm:p-4">
        {books.map((item: Item, i: number) => {
          const { title, description, authors, imageLinks } = item.volumeInfo
          return (
            <div
              className={`relative m-2 h-[260px] max-h-[300px] w-[45%] cursor-pointer rounded-md border border-gray-300 px-2 py-2 shadow hover:bg-gray-100 sm:w-[200px] sm:px-4`}
              key={item.id}
              onMouseEnter={() => setSelectItem(item)}
            >
              <div className="mb-2 h-[220px]">
                <img
                  className="m-auto mb-2 h-[150px] object-contain"
                  src={imageLinks ? imageLinks.thumbnail : NO_IMAGE}
                  alt={title}
                  loading="lazy"
                />
                <div className="mb-1 text-sm font-bold sm:text-base">
                  {truncate(title, 15)}
                </div>
                <div className="text-xs">
                  {Array.isArray(authors)
                    ? truncate(authors.join(','), 12)
                    : '-'}
                </div>
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
    </Modal>
  )
}
