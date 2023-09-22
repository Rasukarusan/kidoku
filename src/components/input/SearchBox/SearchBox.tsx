import { useState } from 'react'
import { SearchModal } from './SearchModal'

interface Props {
  words: string
}

export const SearchBox: React.FC<Props> = ({ words }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <SearchModal
        open={open}
        onClose={() => {
          setOpen(false)
          document.body.classList.remove('no-scroll')
        }}
      />
      <div className="flex items-center justify-center">
        <div className="relative text-gray-600 focus-within:text-gray-400">
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
            className="py-2 text-sm bg-white rounded-md pl-10 pr-2 focus:outline-none text-gray-900 w-96 appearance-none"
            placeholder="Search..."
            autoComplete="off"
            onFocus={() => {
              setOpen(true)
              document.body.classList.add('no-scroll')
            }}
          />
        </div>
      </div>
    </>
  )
}
