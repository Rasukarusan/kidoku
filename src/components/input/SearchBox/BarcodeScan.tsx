import { BarcodeScanner } from '@/components/input/BarcodeScanner'
import { AddModal } from './AddModal'
import { useState } from 'react'
import { SearchResult } from '@/types/search'
import { useSession } from 'next-auth/react'
import { LoginModal } from '@/components/layout/LoginModal'

interface Props {
  input: string
  onClose: () => void
}

export const BarcodeScan: React.FC<Props> = ({ input, onClose }) => {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [book, setBook] = useState<SearchResult>(null)
  const [openLoginModal, setOpenLoginModal] = useState(false)
  return (
    <>
      <AddModal
        open={open}
        item={book}
        onClose={() => {
          onClose()
          setOpen(false)
        }}
      />
      <LoginModal
        open={openLoginModal}
        onClose={() => setOpenLoginModal(false)}
      />
      <div className="p-4">
        <BarcodeScanner
          onDetect={(result) => {
            setBook(result)
            setOpen(true)
            if (!session) {
              setOpenLoginModal(true)
            }
          }}
        />
      </div>
    </>
  )
}
