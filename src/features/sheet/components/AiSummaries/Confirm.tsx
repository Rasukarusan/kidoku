import useSWR from 'swr'
import { Accordion } from '@/components/layout/Accordion'
import { Modal } from '@/components/layout/Modal'
import { CourseId } from '@/types/user'
import { fetcher } from '@/libs/swr'

interface Props {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  courseId: CourseId
  sheetName: string
}

export const Confirm: React.FC<Props> = ({
  open,
  onCancel,
  onConfirm,
  courseId,
  sheetName,
}) => {
  const { data, mutate, isLoading } = useSWR(
    `/api/token?sheetName=${sheetName}&isTotal=0`,
    fetcher
  )
  console.log(data)
  const MAX_TOKEN = 10000
  return (
    <Modal open={open} onClose={onCancel}>
      <div className="w-full rounded-md p-10 sm:w-[450px]">
        <div className="mb-2 text-center text-sm font-bold leading-5">
          今月の残りトークン数：
          <span className="">
            {isLoading ? ' ...' : MAX_TOKEN - data.used_token}/{MAX_TOKEN}
          </span>
          <br />
          分析に必要なトークン数：
          <span className="">{isLoading ? ' ...' : data.token}</span>
        </div>
        <div className="mb-2 text-center text-sm font-bold">
          AI分析を実行しますか？
        </div>
        <div className="mb-2 flex items-center justify-evenly">
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
        <button className="mb-2 text-center text-xs text-blue-400 underline">
          アップグレードして最大トークン数を上げる
        </button>
        <Accordion title="詳細設定" className="text-sm">
          <div className="p-2 text-left">
            内容1
            <div>内容1</div>
            <div>内容1</div>
            <div>内容1</div>
            <div>内容1</div>
            <div>内容1</div>
            <div>内容1</div>
            <div>内容1</div>
            <div>内容1</div>
            <div>内容1</div>
          </div>
        </Accordion>
      </div>
    </Modal>
  )
}
