import { Dispatch, SetStateAction } from 'react'
import { Modal } from '@/components/layout/Modal'

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onClick: () => void
  loading: boolean
}

export const AiReGenerateButton: React.FC<Props> = ({
  open,
  setOpen,
  onClick,
  loading,
}) => {
  return (
    <>
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="absolute bottom-0 left-0 right-0 top-0 z-10 m-auto h-36 w-[360px] rounded-md bg-white px-10 py-10 sm:w-[450px]">
          <div className="mb-4 text-sm font-bold">
            前回の内容は削除されます。 よろしいですか？
          </div>
          <div className="flex items-center justify-evenly">
            <button
              className="w-[130px] rounded-md border bg-gray-400 py-2 text-sm text-white hover:brightness-110"
              onClick={() => setOpen(false)}
            >
              キャンセル
            </button>
            <button
              className="w-[130px] rounded-md border border-ai py-2 text-sm text-ai hover:brightness-125"
              onClick={onClick}
              disabled={loading}
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
      <button
        className="m-4 rounded-md border border-ai px-6 py-3 text-ai hover:brightness-110"
        onClick={() => setOpen(true)}
      >
        AI分析を実行する
      </button>
    </>
  )
}
