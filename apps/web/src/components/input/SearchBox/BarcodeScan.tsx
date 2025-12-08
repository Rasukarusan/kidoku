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

  return (
    <>
      <div className="p-4">
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
