import { BarcodeScanner } from '@/components/input/BarcodeScanner'
import { useSession } from 'next-auth/react'
import { EventType } from '@/types/event_queue'
import { useAtom, useSetAtom } from 'jotai'
import { openAddModalAtom, openLoginModalAtom } from '@/store/modal/atom'
import { addBookAtom } from '@/store/book/atom'

interface Props {
  input: string
  onClose: () => void
}

export const BarcodeScan: React.FC<Props> = ({ input, onClose }) => {
  const { data: session } = useSession()
  const setOpenLoginModal = useSetAtom(openLoginModalAtom)
  const [open, setOpen] = useAtom(openAddModalAtom)
  const setBook = useSetAtom(addBookAtom)

  const sendMessage = async (book) => {
    if (!session) return
    const message = {
      userId: session.user.id,
      event: EventType.AddBook,
      book,
    }
    const res = await fetch('/api/pusher/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })
    if (!res.ok) {
      console.error('failed to push data')
    }
  }

  return (
    <>
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
