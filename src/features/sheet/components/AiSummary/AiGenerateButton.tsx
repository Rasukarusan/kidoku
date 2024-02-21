import { FaCircleNotch } from 'react-icons/fa'
import { MdOutlineRestartAlt } from 'react-icons/md'

interface Props {
  onClick: () => void
  generating: boolean
}

export const AiGenerateButton: React.FC<Props> = ({ onClick, generating }) => {
  return (
    <div className="mx-auto flex w-full items-center justify-center rounded-lg bg-[#f7f6f3] bg-gradient-to-b p-4 text-center text-gray-700 sm:w-3/4">
      <button
        type="button"
        className="flex items-center rounded-md px-2 py-1 hover:font-bold"
        onClick={onClick}
        disabled={generating}
      >
        {generating ? (
          <FaCircleNotch size={25} className="mr-2 animate-spin text-ai" />
        ) : (
          <MdOutlineRestartAlt size={25} className="mr-2 text-ai" />
        )}
        {generating ? (
          <span className="animate-pulse">AI分析中...</span>
        ) : (
          <span className="underline">AIの分析を始める</span>
        )}
      </button>
    </div>
  )
}
