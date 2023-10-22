import { useState } from 'react'
import { SearchModal } from './SearchModal'

export const SearchBox: React.FC = () => {
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
      <div className="relative text-gray-600 focus-within:text-gray-400">
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
          type="search"
          name="q"
          className="w-48 cursor-pointer appearance-none rounded-md bg-white py-2 pl-10 pr-2 text-sm text-gray-900 sm:w-96"
          placeholder="本を追加"
          autoComplete="off"
          onFocus={() => {
            setOpen(true)
            document.body.classList.add('no-scroll')
          }}
        />
      </div>
    </>
  )
}
