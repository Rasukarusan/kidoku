import { EnhancedBarcodeScanner } from '@/components/input/EnhancedBarcodeScanner'
import { useSession } from 'next-auth/react'
import { useSetAtom } from 'jotai'
import { openLoginModalAtom } from '@/store/modal/atom'
import { useState } from 'react'
import { ManualRegisterButton } from './ManualRegisterButton'
import { SearchResult } from '@/types/search'

interface Props {
  input: string
  onClose: () => void
  onSelectBook: (book: SearchResult) => void
}

export const BarcodeScan: React.FC<Props> = ({ onSelectBook }) => {
  const { data: session } = useSession()
  const setOpenLoginModal = useSetAtom(openLoginModalAtom)
  const [scanError, setScanError] = useState<string>('')

  return (
    <>
      <div className="p-4">
        {/* 手動登録ボタン */}
        <div className="mb-4">
          <ManualRegisterButton
            helpText="バーコードが読み取れない本を手動で登録できます"
            onSelectBook={onSelectBook}
          />
        </div>

        {scanError && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {scanError}
          </div>
        )}
        <EnhancedBarcodeScanner
          onDetect={(result) => {
            if (!session) {
              setOpenLoginModal(true)
              return
            }
            onSelectBook(result)
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
