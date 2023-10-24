import { useEffect, useRef, useState } from 'react'
import { Modal } from '@/components/layout/Modal'

interface Props {
  open: boolean
  onClose: () => void
}

export const SheetAddModal: React.FC<Props> = ({ open, onClose }) => {
  const [newSheet, setNewSheet] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [open])

  return (
    <Modal open={open} onClose={onClose} className="h-[250px] w-[500px]">
      <div className="p-10 text-center">
        <div className="mb-8 text-2xl font-bold">新しいシートを作成</div>
        <input
          ref={ref}
          className="mx-auto mb-8 block w-2/3 rounded-md border p-2"
          type="text"
          onChange={(e) => {
            setNewSheet(e.target.value)
          }}
          value={newSheet}
          placeholder="シート名を入力"
        />
        <button
          className="rounded-md bg-blue-700 px-4 py-1 font-bold text-white disabled:bg-blue-300"
          disabled={!newSheet}
          onClick={async () => {
            const res = await fetch('/api/sheets', {
              method: 'POST',
              body: JSON.stringify({ name: newSheet }),
              headers: {
                Accept: 'application/json',
              },
            }).then((res) => res.json())
            console.log(res)
          }}
        >
          追加する
        </button>
      </div>
    </Modal>
  )
}
