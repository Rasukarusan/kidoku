import { Modal } from '@/components/layout/Modal'

interface Props {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  isReset: boolean
}

export const Confirm: React.FC<Props> = ({
  open,
  onCancel,
  onConfirm,
  isReset,
}) => {
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="absolute bottom-0 left-0 right-0 top-0 z-10 m-auto h-36 w-[360px] rounded-md bg-white px-10 py-10 sm:w-[450px]">
        <div className="mb-4 text-center text-sm font-bold">
          {isReset
            ? '前回の内容は削除されます。 よろしいですか？'
            : 'AI分析を実行しますか？'}
        </div>
        <div className="flex items-center justify-evenly">
          <button
            className="w-[130px] rounded-md border bg-gray-400 py-2 text-sm text-white hover:brightness-110"
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            className="w-[130px] rounded-md border border-ai py-2 text-sm text-ai hover:brightness-125"
            onClick={onConfirm}
          >
            OK
          </button>
        </div>
      </div>
    </Modal>
  )
}
