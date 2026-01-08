import { useEffect, useRef, useState } from 'react'
import { Modal } from '@/components/layout/Modal'
import { useReward } from 'react-rewards'
import { SuccessAlert } from '@/components/label/SuccessAlert'
import { DangerAlert } from '@/components/label/DangerAlert'
import { useMutation } from '@apollo/client'
import { CREATE_SHEET } from '../api'

interface Props {
  open: boolean
  onClose: () => void
}
interface Response {
  result: boolean
}

export const SheetAddModal: React.FC<Props> = ({ open, onClose }) => {
  const [newSheet, setNewSheet] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  const { reward } = useReward('rewardId', 'confetti', {
    elementCount: 200,
  })
  const [response, setResponse] = useState<Response>(null)
  const [createSheet] = useMutation(CREATE_SHEET)

  useEffect(() => {
    ref.current?.focus()
  }, [open])

  return (
    <Modal
      open={open}
      onClose={() => {
        setNewSheet('')
        onClose()
      }}
      className="h-auto min-h-[200px] max-w-[500px]"
    >
      <div className="p-10 text-center">
        <div className="mb-4 text-2xl font-bold">新しいシートを作成</div>
        <input
          ref={ref}
          className="mx-auto mb-4 block w-[90%] rounded-md border p-2 sm:w-2/3"
          type="text"
          onChange={(e) => {
            setNewSheet(e.target.value)
          }}
          value={newSheet}
          placeholder="シート名を入力"
        />
        {response && (
          <div className="absolute left-1/2 z-20 -translate-x-1/2 transform">
            {response.result ? (
              <SuccessAlert
                open={!!response}
                text="シートを追加しました"
                onClose={() => {
                  setResponse(null)
                }}
              />
            ) : (
              <DangerAlert
                open={!!response}
                text="シートの追加に失敗しました"
                onClose={() => {
                  setResponse(null)
                }}
              />
            )}
          </div>
        )}
        <button
          className="rounded-md bg-blue-700 px-4 py-1 font-bold text-white disabled:bg-blue-300"
          disabled={!newSheet}
          onClick={async () => {
            try {
              await createSheet({
                variables: {
                  input: {
                    name: newSheet,
                  },
                },
              })
              setResponse({ result: true })
              reward()
            } catch (error) {
              setResponse({ result: false })
            }
          }}
        >
          <span id="rewardId">追加する</span>
        </button>
      </div>
    </Modal>
  )
}
