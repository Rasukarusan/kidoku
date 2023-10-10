import { Item } from '@/types/search'
import { searchBooks } from '@/utils/search'
import { truncate } from '@/utils/string'
import { Modal } from '@/components/layout/Modal'
import { useEffect, useRef, useState } from 'react'
import { AddModal } from './AddModal'
// import { items } from './mock'
import { NO_IMAGE } from '@/libs/constants'

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
  // 検索モーダル開いたら自動でinputフィールドにフォーカスする
  useEffect(() => {
    ref.current?.focus()
  }, [open])

  // デバウンス。入力から一定時間経った後に検索を実行する。
  // 300ms以内に入力があった場合はタイマーがクリアされ、新しいタイマーが設定され、デバウンスが実現される。
  useEffect(() => {
    if (!inputValue) return
    const timer = setTimeout(async () => {
      const items = await searchBooks(inputValue)
      setBooks(items)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <Modal open={open} onClose={onClose} className="sm:w-1/2 h-3/4">
      <AddModal
        open={openAddModal}
        item={selectItem}
        books={books}
        onClose={() => setOpenAddModal(false)}
      />
      <div className="flex items-center border-b-[#f1f5f9] border-b pt-2 px-2 shrink-0">
        <div className="relative text-gray-600 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <button
              type="submit"
              className="p-1 focus:outline-none focus:shadow-outline"
            >
              <svg
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="w-6 h-6"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>
          </span>
          <input
            ref={ref}
            type="search"
            name="q"
            className="py-2 text-sm bg-white rounded-md pl-12 pr-2 h-12 focus:outline-none text-gray-900 w-full appearance-none"
            placeholder="本を追加"
            autoComplete="off"
            onChange={onChange}
          />
        </div>
      </div>
      <div className="w-full text-gray-900 p-2 sm:p-4 flex flex-wrap justify-center overflow-y-auto h-full">
        {books.map((item: Item, i: number) => {
          const { title, description, authors, imageLinks } = item.volumeInfo
          return (
            <div
              className={`w-[45%] sm:w-[200px] max-h-[300px] h-[260px] border border-gray-300 m-2 px-2 sm:px-4 py-2 rounded-md shadow cursor-pointer hover:bg-gray-100 relative`}
              key={item.id}
              onMouseEnter={() => setSelectItem(item)}
            >
              <div className="h-[220px] mb-2">
                <img
                  className="m-auto mb-2 h-[150px] object-contain"
                  src={imageLinks ? imageLinks.thumbnail : NO_IMAGE}
                  alt={title}
                  loading="lazy"
                />
                <div className="text-sm sm:text-base font-bold mb-1">
                  {truncate(title, 15)}
                </div>
                <div className="text-xs">
                  {Array.isArray(authors)
                    ? truncate(authors.join(','), 12)
                    : '-'}
                </div>
                {selectItem?.id === item.id && (
                  <div className="text-center absolute left-1/2 -translate-x-2/4 bottom-0 w-full opacity-80 hover:opacity-100">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-xs text-white py-2 font-bold w-full rounded-md"
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
