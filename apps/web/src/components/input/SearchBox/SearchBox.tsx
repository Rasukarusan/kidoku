import { useAtom } from 'jotai'
import { useHotkeys } from 'react-hotkeys-hook'
import { AiOutlineSearch } from 'react-icons/ai'
import { openSearchModalAtom } from '@/store/modal/atom'

export const SearchBox: React.FC = () => {
  const [open, setOpen] = useAtom(openSearchModalAtom)
  useHotkeys(
    'meta+k, ctrl+k',
    () => {
      setOpen(!open)
    },
    { preventDefault: true }
  )
  return (
    <>
      <div className="relative rounded-md border-none border-gray-200 text-gray-600 focus-within:text-gray-400">
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
          className="w-full cursor-pointer appearance-none rounded-md bg-white py-2 pl-10 pr-2 text-base text-gray-900 sm:text-sm"
          placeholder="本のタイトルを入力..."
          autoComplete="off"
          onFocus={(e) => {
            e.target.blur()
            setOpen(true)
          }}
        />
      </div>
    </>
  )
}
