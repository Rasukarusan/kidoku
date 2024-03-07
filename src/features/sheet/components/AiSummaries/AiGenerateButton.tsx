import { Dispatch, SetStateAction } from 'react'
import { MdOutlineRestartAlt } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import { Confirm } from './Confirm'

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onClick: () => void
  loading: boolean
}

export const AiGenerateButton: React.FC<Props> = ({
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
      <div className="mx-auto flex w-full items-center justify-center rounded-lg bg-ai-summary bg-gradient-to-b p-4 text-center text-gray-700 sm:w-3/4">
        <button
          type="button"
          className={twMerge(
            'flex items-center rounded-md px-2 py-1',
            !loading && 'hover:font-bold'
          )}
          onClick={() => setOpen(true)}
          disabled={loading}
        >
          <MdOutlineRestartAlt size={25} className="mr-2 text-ai" />
          <span className="underline">AIの分析を始める</span>
        </button>
      </div>
    </>
  )
}
