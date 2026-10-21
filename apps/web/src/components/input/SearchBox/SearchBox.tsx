import { useState } from 'react'
import { useRouter } from 'next/router'
import { useHotkeys } from 'react-hotkeys-hook'
import { AiOutlineSearch } from 'react-icons/ai'
import { useReadingRecordsUrl } from '@/hooks/useReadingRecordsUrl'

export const SearchBox: React.FC = () => {
  const router = useRouter()
  const collectionsUrl = useReadingRecordsUrl()
  const [query, setQuery] = useState('')
  useHotkeys(
    'meta+k, ctrl+k',
    () => {
      document.getElementById('collection-search')?.focus()
    },
    { preventDefault: true }
  )
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        void router.push(`${collectionsUrl}?q=${encodeURIComponent(query)}`)
      }}
      className="relative rounded-md text-gray-600"
    >
      <button
        type="submit"
        aria-label="アイテムを検索"
        className="absolute inset-y-0 left-0 flex items-center px-3"
      >
        <AiOutlineSearch size={20} />
      </button>
      <input
        id="collection-search"
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="w-full appearance-none rounded-md bg-white py-2 pl-10 pr-2 text-base text-gray-900 sm:text-sm"
        placeholder="コレクションのアイテムを検索..."
        autoComplete="off"
      />
    </form>
  )
}
