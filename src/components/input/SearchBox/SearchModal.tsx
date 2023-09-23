import { Loading } from '@/components/icon/Loading'
import { Item } from '@/types/search'
import { searchBooks } from '@/utils/search'
import { truncate } from '@/utils/string'
import { useEffect, useRef, useState } from 'react'
import { useReward } from 'react-rewards'
// import { items } from './mock'

interface Props {
  open: boolean
  onClose: () => void
}
export const SearchModal: React.FC<Props> = ({ open, onClose }) => {
  const ref = useRef<HTMLInputElement>(null)
  const [results, setResults] = useState<Item[]>([])
  const [selectId, setSelectId] = useState('')
  const [loading, setLoading] = useState(false)
  const { reward, isAnimating } = useReward('rewardId', 'confetti', {
    elementCount: 200,
  })

  useEffect(() => {
    ref.current?.focus()
  }, [open])

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchWord = e.target.value
    if (searchWord) {
      const items = await searchBooks(searchWord)
      setResults(items.slice(0, 9))
    }
  }

  const onClickAdd = async () => {
    setLoading(true)
    const book = results.filter((item) => item.id === selectId).pop()
    if (!book) return
    const { title, description, authors, imageLinks, categories } =
      book.volumeInfo
    const author = authors ? authors.join(',') : '-'
    const category = categories ? categories.join(',') : '-'
    const image = imageLinks ? imageLinks.thumbnail : '/no-image.png'
    const res = await fetch(`/api/books`, {
      method: 'POST',
      body: JSON.stringify({ title, description, author, image, category }),
      headers: {
        Accept: 'application/json',
      },
    })
    reward()
    setSelectId('')
    setLoading(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed w-full h-full backdrop-blur-[4px] flex justify-center items-center z-[1000] left-0 top-0 bg-[rgba(0,0,0,0.1)] overflow-y-hidden"
      onClick={onClose}
    >
      <div
        className="w-2/3 bg-white h-3/4 rounded-md overflow-y-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center border-b-[#f1f5f9] border-b pt-2 px-2">
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
              placeholder="Search..."
              autoComplete="off"
              onChange={onChange}
            />
          </div>
        </div>
        <div className="w-full text-gray-900 p-4 flex flex-wrap justify-center overflow-y-auto h-full mb-4 max-h-[60vh]">
          {results.map((item: Item, i: number) => {
            const { title, description, authors, imageLinks } = item.volumeInfo
            return (
              <div
                className="w-[200px] max-h-[300px] h-[300px] border border-gray-300 m-2 px-4 py-2 rounded-md shadow cursor-pointer"
                key={item.id}
                style={{
                  background:
                    selectId === item.id ? 'rgba(245, 88, 194, 0.2)' : 'white',
                }}
                onClick={() => setSelectId(item.id)}
              >
                <div className="font-bold mb-1">{truncate(title, 15)}</div>
                <div className="text-xs mb-1">
                  {Array.isArray(authors)
                    ? truncate(authors.join(','), 12)
                    : '-'}
                </div>
                <img
                  className="m-auto mb-1 h-[150px] object-contain"
                  src={imageLinks ? imageLinks.thumbnail : '/no-image.png'}
                  alt={title}
                />
                <div className="text-sm">{truncate(description, 30)}</div>
              </div>
            )
          })}
        </div>
        <div
          className={`w-full text-center h-[50px] flex items-center justify-center ${
            selectId ? 'bg-blue-600' : 'bg-gray-400'
          }`}
        >
          <button
            className="font-bold text-white flex items-center disabled:font-medium"
            onClick={onClickAdd}
            disabled={selectId === '' || isAnimating}
          >
            {loading && (
              <Loading className="w-[18px] h-[18px] border-[3px] mr-2 border-white" />
            )}
            <span id="rewardId">追加する</span>
          </button>
        </div>
      </div>
    </div>
  )
}
