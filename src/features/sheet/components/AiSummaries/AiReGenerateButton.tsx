import { Dispatch, SetStateAction } from 'react'
import { Confirm } from './Confirm'

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
      <Confirm
        open={open}
        setOpen={setOpen}
        onClick={onClick}
        loading={loading}
      />
      <button
        className="m-4 rounded-md border border-ai px-6 py-3 text-ai hover:brightness-110"
        onClick={() => setOpen(true)}
      >
        AI分析を実行する
      </button>
    </>
  )
}
