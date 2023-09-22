import { Area } from '@/features/index/components'
import { Results } from '@/features/index/types'
import { searchBooks } from '@/utils/search'
import { useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
}
export const SearchModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null
  const [searchWords, setSearchWords] = useState<string[]>([])
  const [results, setResults] = useState<Results>({})
  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchWord = e.target.value
    setSearchWords([searchWord])
    const newResults = {}
    newResults[searchWord] = await searchBooks(searchWord)
    setResults(newResults)
  }
  return (
    <div
      className="fixed w-full h-full backdrop-blur-[4px] flex justify-center items-center z-[1000] left-0 top-0 bg-[rgba(0,0,0,0.1)] overflow-y-hidden"
      onClick={onClose}
    >
      <div
        className="w-2/3 bg-white h-3/4 rounded-md overflow-y-auto"
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
              type="search"
              name="q"
              className="py-2 text-sm bg-white rounded-md pl-12 pr-2 h-12 focus:outline-none text-gray-900 w-full appearance-none"
              placeholder="Search..."
              autoComplete="off"
              onChange={onChange}
            />
          </div>
        </div>
        <Area results={results} searchWords={searchWords} />
      </div>
    </div>
  )
}
