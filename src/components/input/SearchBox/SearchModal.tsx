import { Modal } from '@/components/layout/Modal'
import { useEffect, useRef, useState } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import { Books } from './Books'
import { UserBooks } from './UserBooks'
import { BarcodeScan } from './BarcodeScan'
import { openSearchModalAtom } from '@/store/modal/atom'
import { useAtom } from 'jotai'
import { Template } from './Template'

export const SearchModal: React.FC = () => {
  const [open, setOpen] = useAtom(openSearchModalAtom)
  const ref = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState<'title' | 'barcode' | 'template' | 'user'>(
    'title'
  )
  const [inputValue, setInputValue] = useState('')

  // 検索モーダル開いたら自動でinputフィールドにフォーカスする
  useEffect(() => {
    if (tab !== 'barcode') {
      ref.current?.focus()
    }
  }, [open, tab])

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (tab === 'barcode') {
      setTab('title')
    }
    setInputValue(e.target.value)
  }

  const onClose = () => {
    setOpen(false)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="h-3/4 w-full overflow-auto sm:w-1/2"
    >
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
            className="h-12 w-full appearance-none rounded-md bg-white py-2 pl-16 pr-2 text-sm text-gray-900 focus:outline-none"
            placeholder="本のタイトルを入力..."
            autoComplete="off"
            onChange={onChange}
          />
        </div>
      </div>
      <div className="flex h-9 items-center overflow-x-auto overflow-y-hidden p-6 text-sm">
        <button
          className={`flex text-nowrap px-4 py-2 hover:bg-gray-100
            ${tab === 'barcode' ? 'font-bold' : 'text-gray-400 '}`}
          onClick={() => setTab('barcode')}
        >
          バーコード検索
        </button>
        <button
          className={`text-nowrap px-4 py-2 hover:bg-gray-100 ${
            tab === 'title' ? 'font-bold' : 'text-gray-400'
          }`}
          onClick={() => setTab('title')}
        >
          タイトル検索
        </button>
        <button
          className={`text-nowrap px-4 py-2 hover:bg-gray-100 ${
            tab === 'template' ? 'font-bold' : 'text-gray-400'
          }`}
          onClick={() => setTab('template')}
        >
          テンプレートから登録
        </button>
        <button
          className={`text-nowrap px-4 py-2 hover:bg-gray-100
            ${tab === 'user' ? 'font-bold' : 'text-gray-400 '}`}
          onClick={() => setTab('user')}
        >
          ユーザー本棚
        </button>
      </div>
      {tab === 'title' ? (
        <Books input={inputValue} onClose={onClose} />
      ) : tab === 'barcode' ? (
        <BarcodeScan input={inputValue} onClose={onClose} />
      ) : tab === 'template' ? (
        <Template input={inputValue} onClose={onClose} />
      ) : (
        <UserBooks input={inputValue} onClose={onClose} />
      )}
    </Modal>
  )
}
