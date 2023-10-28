import { Modal } from '@/components/layout/Modal'
import { useEffect, useRef, useState } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import { Books } from './Books'
import { UserBooks } from './UserBooks'

interface Props {
  open: boolean
  onClose: () => void
}
export const SearchModal: React.FC<Props> = ({ open, onClose }) => {
  const ref = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'api' | 'user'>('api')
  const [inputValue, setInputValue] = useState('')

  // 検索モーダル開いたら自動でinputフィールドにフォーカスする
  useEffect(() => {
    ref.current?.focus()
  }, [open])

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <Modal open={open} onClose={onClose} className="h-3/4 w-full sm:w-1/2">
      <div className="flex shrink-0 items-center border-b border-b-[#f1f5f9] px-2 pt-2">
        <div className="relative w-full text-gray-600">
          <span className="absolute inset-y-0 left-0 flex items-center pl-2">
            <button
              type="submit"
              className="focus:shadow-outline p-1 focus:outline-none"
            >
              <AiOutlineSearch size={20} />
            </button>
          </span>
          <input
            ref={ref}
            type="search"
            name="q"
            className="h-12 w-full appearance-none rounded-md bg-white py-2 pl-12 pr-2 text-sm text-gray-900 focus:outline-none"
            placeholder="本のタイトルを入力..."
            autoComplete="off"
            onChange={onChange}
          />
        </div>
      </div>
      <div className="flex items-center px-4 pt-4 text-sm">
        <button
          className={`px-4 py-2 hover:bg-gray-100 ${
            tab === 'api' ? 'font-bold' : 'text-gray-400'
          }`}
          onClick={() => setTab('api')}
        >
          検索結果
        </button>
        <button
          className={`px-4 py-2 hover:bg-gray-100
            ${tab === 'user' ? 'font-bold' : 'text-gray-400 '}`}
          onClick={() => setTab('user')}
        >
          ユーザー本棚
        </button>
      </div>
      {tab === 'api' ? (
        <Books input={inputValue} />
      ) : (
        <UserBooks input={inputValue} />
      )}
    </Modal>
  )
}
