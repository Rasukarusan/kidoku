import { useEffect, useRef, useState } from 'react'
import { Modal } from '@/components/layout/Modal'
import { Loading } from '@/components/icon/Loading'

interface Props {
  sheet: string
  open: boolean
  onClose: () => void
  username: string
}

export const SheetEditModal: React.FC<Props> = ({
  sheet,
  open,
  onClose,
  username,
}) => {
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState(sheet)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    ref.current?.focus()
  }, [open])

  return (
    <Modal open={open} onClose={onClose} className="h-[200px] w-[500px]">
      <div className="p-4 text-center sm:p-10">
        <div className="mb-4 text-2xl font-bold">シート名を編集</div>
        <input
          ref={ref}
          className="mx-auto mb-4 block w-2/3 rounded-md border p-2"
          type="text"
          onChange={(e) => {
            setInput(e.target.value)
          }}
          value={input}
        />
        <button
          className="mx-auto flex items-center justify-center rounded-md bg-green-600 px-4 py-1 font-bold text-white disabled:bg-gray-300"
          disabled={!input || loading}
          onClick={async () => {
            setLoading(true)
            const res = await fetch('/api/sheets', {
              method: 'PUT',
              body: JSON.stringify({ oldName: sheet, newName: input }),
              headers: {
                Accept: 'application/json',
              },
            }).then((res) => res.json())
            if (!res.result) {
              setLoading(false)
              alert('シート名の更新に失敗しました')
              return
            }
            alert('更新しました')
            location.href = `/${username}/sheets`
          }}
        >
          {loading ? (
            <>
              <Loading className="mr-2 h-[20px] w-[20px] border-white text-white" />
              <span>更新中...</span>
            </>
          ) : (
            <span>更新する</span>
          )}
        </button>
      </div>
    </Modal>
  )
}
