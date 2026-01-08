import { useEffect, useRef, useState } from 'react'
import { Modal } from '@/components/layout/Modal'
import { Loading } from '@/components/icon/Loading'
import { useMutation } from '@apollo/client'
import { UPDATE_SHEET } from '../api'

interface Props {
  sheetName: string
  sheetId?: string
  open: boolean
  onClose: () => void
  username: string
}

export const SheetEditModal: React.FC<Props> = ({
  sheetName,
  sheetId,
  open,
  onClose,
  username,
}) => {
  const [input, setInput] = useState(sheetName)
  const ref = useRef<HTMLInputElement>(null)
  const [updateSheet, { loading }] = useMutation(UPDATE_SHEET)

  useEffect(() => {
    ref.current?.focus()
  }, [open])

  useEffect(() => {
    setInput(sheetName)
  }, [sheetName])

  return (
    <Modal
      open={open}
      onClose={() => {
        setInput(sheetName)
        onClose()
      }}
      className="h-auto min-h-[200px] max-w-[500px]"
    >
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
          disabled={input === sheetName || loading || !sheetId}
          onClick={async () => {
            if (!sheetId) return
            try {
              await updateSheet({
                variables: {
                  input: {
                    id: sheetId,
                    name: input,
                  },
                },
              })
              alert('更新しました')
              location.href = `/${username}/sheets/${input}`
            } catch (error) {
              alert('シート名の更新に失敗しました')
            }
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
