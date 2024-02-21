import { FaNotEqual } from 'react-icons/fa'

interface Props {
  text: string
}

export const Error: React.FC<Props> = ({ text }) => {
  return (
    <div className="mx-auto flex w-full items-center justify-center rounded-lg bg-[#f7f6f3] bg-gradient-to-b p-4 text-center text-gray-700 sm:w-3/4">
      <FaNotEqual className="mr-2 text-ai" />
      {text}
    </div>
  )
}
