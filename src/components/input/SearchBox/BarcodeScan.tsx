import { BarcodeScanner } from '@/components/input/BarcodeScanner'
import { AddModal } from './AddModal'
import { useState } from 'react'
import { SearchResult } from '@/types/search'

interface Props {
  input: string
  onClose: () => void
}

export const BarcodeScan: React.FC<Props> = ({ input, onClose }) => {
  const [open, setOpen] = useState(false)
  const [book, setBook] = useState<SearchResult>(null)
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
      <div className="p-4">
        <BarcodeScanner
          onDetect={(result) => {
            setBook(result)
            setOpen(true)
          }}
        />
      </div>
    </>
  )
}
