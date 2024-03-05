import { FaNotEqual } from 'react-icons/fa'

export const Empty: React.FC = () => {
  return (
    <div className="mx-auto flex w-full items-center justify-center rounded-lg bg-ai-bg bg-gradient-to-b p-4 text-center text-gray-700 sm:w-3/4">
      <FaNotEqual className="mr-2 text-ai" />
      AIの分析結果はありません。
    </div>
  )
}
