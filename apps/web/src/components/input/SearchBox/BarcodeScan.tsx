import { EnhancedBarcodeScanner } from '@/components/input/EnhancedBarcodeScanner'
import { useSession } from 'next-auth/react'
import { useSetAtom } from 'jotai'
import { openAddModalAtom, openLoginModalAtom } from '@/store/modal/atom'
import { addBookAtom } from '@/store/book/atom'
import { useState } from 'react'

interface Props {
  input: string
  onClose: () => void
}

export const BarcodeScan: React.FC<Props> = () => {
  const { data: session } = useSession()
  const setOpenLoginModal = useSetAtom(openLoginModalAtom)
  const setOpen = useSetAtom(openAddModalAtom)
  const setBook = useSetAtom(addBookAtom)
  const [scanError, setScanError] = useState<string>('')

  const handleManualRegister = () => {
    if (!session) {
      setOpenLoginModal(true)
      return
    }
    // 空の本情報を設定してAddModalを開く
    setBook({
      id: '',
      title: '',
      author: '',
      image: '',
      category: '-',
      memo: '',
    })
    setOpen(true)
  }

  return (
    <>
      <div className="p-4">
        {/* 手動登録ボタン */}
        <div className="mb-4">
          <button
            className="w-full rounded-md bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
            onClick={handleManualRegister}
            disabled={!session}
          >
            {session ? '手動で登録' : 'ログインしてください'}
          </button>
          <p className="mt-2 text-center text-xs text-gray-500">
            バーコードが読み取れない本を手動で登録できます
          </p>
        </div>

        {scanError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {scanError}
          </div>
        )}
        <EnhancedBarcodeScanner
          onDetect={(result) => {
            setBook(result)
            setOpen(true)
            if (!session) {
              setOpenLoginModal(true)
            }
          }}
          onError={(error) => {
            setScanError(error)
            setTimeout(() => setScanError(''), 5000)
          }}
        />
      </div>
    </>
  )
}
