import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { AiOutlineSearch } from 'react-icons/ai'
import { SearchModal } from './SearchModal'

export const SearchBox: React.FC = () => {
  const [open, setOpen] = useState(false)
  useHotkeys(
    'meta+k, ctrl+k',
    () => {
      setOpen(!open)
    },
    { preventDefault: true }
  )
  return (
    <>
      <SearchModal
        open={open}
        onClose={() => {
          setOpen(false)
          document.body.classList.remove('no-scroll')
        }}
      />
      <div className="relative rounded-md border border-gray-200 text-gray-600 focus-within:text-gray-400">
        <span className="absolute inset-y-0 left-0 flex items-center pl-2">
          <button
            type="submit"
            className="focus:shadow-outline p-1 focus:outline-none"
          >
            <AiOutlineSearch size={20} />
          </button>
        </span>
        <input
          type="search"
          name="q"
          className="w-48 cursor-pointer appearance-none rounded-md bg-white py-2 pl-10 pr-2 text-sm text-gray-900 sm:w-96"
          placeholder="本のタイトルを入力..."
          autoComplete="off"
          onFocus={(e) => {
            e.target.blur()
            setOpen(true)
            document.body.classList.add('no-scroll')
          }}
        />
      </div>
    </>
  )
}
