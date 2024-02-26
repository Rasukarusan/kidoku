import { BarcodeScanner } from '@/components/input/BarcodeScanner'
import { AddModal } from './AddModal'
import { useState } from 'react'
import { SearchResult } from '@/types/search'
import { useSession } from 'next-auth/react'
import { LoginModal } from '@/components/layout/LoginModal'
import { socketAtom } from '@/store/socket'
import { useAtomValue } from 'jotai'
import { EventType } from '@/types/event_queue'

interface Props {
  input: string
  onClose: () => void
}

export const BarcodeScan: React.FC<Props> = ({ input, onClose }) => {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [book, setBook] = useState<SearchResult>(null)
  const [openLoginModal, setOpenLoginModal] = useState(false)
  const socket = useAtomValue(socketAtom)

  const sendMessage = (book) => {
    if (!socket) return
    console.log('send')
    const message = {
      event: EventType.AddBook,
      message: book,
    }
    socket.send(JSON.stringify(message))
  }

  return (
    <>
      <AddModal
        open={open}
        item={book}
        onClose={() => {
          // onClose()
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
              return
            }
            sendMessage(result)
          }}
        />
      </div>
    </>
  )
}
