import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { Modal } from '@/components/layout/Modal'

interface Props {
  sheets: string[]
  value: string
  username: string
}
export const Tabs: React.FC<Props> = ({ value, sheets, username }) => {
  const router = useRouter()
  const [tab, setTab] = useState(value)
  const [open, setOpen] = useState(false)
  const [newSheet, setNewSheet] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [open])

  const onClick = (value: string) => {
    setTab(value)
    router.push(`/${username}/sheets/${value}`)
  }

  return (
    <div className="no-scrollbar flex items-center justify-start overflow-x-auto">
      {['total', ...sheets].map((sheet) => (
        <button
          key={sheet}
          className={`w-[90px] px-8 py-3 text-center text-sm uppercase text-gray-600 duration-300 ease-in hover:bg-gray-100 ${
            tab === sheet ? 'border-b-2 border-gray-900' : ''
          }`}
          onClick={() => onClick(sheet)}
        >
          {sheet}
        </button>
      ))}
      <button
        className="w-[90px] px-8 py-3 text-center text-sm uppercase text-gray-600 duration-300 ease-in hover:bg-gray-100"
        onClick={() => {
          setOpen(true)
        }}
      >
        ＋
      </button>
      <Modal open={open} onClose={() => setOpen(false)} className="h-1/4 w-1/3">
        <div className="p-10 text-center">
          <div className="mb-4 text-2xl font-bold">新しいシートを作成</div>
          <input
            ref={ref}
            className="mx-auto mb-4 block w-2/3 rounded-md border p-2"
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
    </div>
  )
}
