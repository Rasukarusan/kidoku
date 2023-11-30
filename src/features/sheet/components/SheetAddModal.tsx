import { useEffect, useRef, useState } from 'react'
import { Modal } from '@/components/layout/Modal'
import { useReward } from 'react-rewards'
import { SuccessAlert } from '@/components/label/SuccessAlert'
import { DangerAlert } from '@/components/label/DangerAlert'

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
  const { reward, isAnimating } = useReward('rewardId', 'confetti', {
    elementCount: 200,
  })
  const [response, setResponse] = useState<Response>(null)

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
      className="h-[200px] w-[500px]"
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
            const res = await fetch('/api/sheets', {
              method: 'POST',
              body: JSON.stringify({ name: newSheet }),
              headers: {
                Accept: 'application/json',
              },
            }).then((res) => res.json())
            setResponse(res)
            if (res.result) {
              reward()
            }
          }}
        >
          <span id="rewardId">追加する</span>
        </button>
      </div>
    </Modal>
  )
}
