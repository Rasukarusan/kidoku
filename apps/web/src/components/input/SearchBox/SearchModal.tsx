import { Modal } from '@/components/layout/Modal'
import { useEffect, useRef, useState } from 'react'
import { AiOutlineCamera, AiOutlineSearch } from 'react-icons/ai'
import { Books } from './Books'
import { UserBooks } from './UserBooks'
import { BarcodeScan } from './BarcodeScan'
import { openSearchModalAtom } from '@/store/modal/atom'
import { useAtom } from 'jotai'
import { Template } from './Template'
import { ISBNSearchResult } from './ISBNSearchResult'

/**
 * 入力がISBN形式かどうかを判定する
 * ハイフン・スペースを除去した後、10桁または13桁の数字（ISBN-10は末尾Xも可）であればISBNと判定
 */
const isISBNLike = (input: string): boolean => {
  const cleaned = input.replace(/[-\s]/g, '')
  if (cleaned.length === 10) {
    return /^\d{9}[\dX]$/i.test(cleaned)
  }
  if (cleaned.length === 13) {
    return /^\d{13}$/.test(cleaned)
  }
  return false
}

export const SearchModal: React.FC = () => {
  const [open, setOpen] = useAtom(openSearchModalAtom)
  const ref = useRef<HTMLInputElement>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [inputValue, setInputValue] = useState('')

  // モーダル開いたら自動でinputフィールドにフォーカスする（カメラモード以外）
  useEffect(() => {
    if (!showCamera) {
      ref.current?.focus()
    }
  }, [open, showCamera])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showCamera) {
      setShowCamera(false)
    }
    setInputValue(e.target.value)
  }

  const onClose = () => {
    setOpen(false)
  }

  const isISBN = isISBNLike(inputValue)

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="h-3/4 w-full overflow-auto sm:w-3/4 lg:w-1/2"
    >
      {/* 検索入力 + カメラボタン */}
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
            className="h-12 w-full appearance-none rounded-md bg-white py-2 pl-16 pr-12 text-sm text-gray-900 focus:outline-none"
            placeholder="本のタイトルまたはISBNを入力..."
            autoComplete="off"
            onChange={onChange}
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-2">
            <button
              type="button"
              className={`rounded-md p-2 transition-colors ${
                showCamera
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
              }`}
              onClick={() => setShowCamera(!showCamera)}
              title="バーコードスキャン"
            >
              <AiOutlineCamera size={20} />
            </button>
          </span>
        </div>
      </div>

      {/* コンテンツエリア */}
      {showCamera ? (
        <BarcodeScan input={inputValue} onClose={onClose} />
      ) : inputValue ? (
        isISBN ? (
          <ISBNSearchResult isbn={inputValue} onClose={onClose} />
        ) : (
          <>
            <Books input={inputValue} onClose={onClose} />
            {/* ユーザー本棚セクション */}
            <div className="border-t border-gray-200">
              <div className="px-4 pt-3 text-xs font-medium text-gray-400">
                ユーザー本棚
              </div>
              <UserBooks input={inputValue} onClose={onClose} />
            </div>
          </>
        )
      ) : (
        <Template input={inputValue} onClose={onClose} />
      )}
    </Modal>
  )
}
