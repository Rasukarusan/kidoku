import { useState } from 'react'
import { useRouter } from 'next/router'

interface Props {
  sheets: string[]
  value: string
  username: string
}
export const Tabs: React.FC<Props> = ({ value, sheets, username }) => {
  const router = useRouter()
  const [tab, setTab] = useState(value)

  const onClick = (value: string) => {
    setTab(value)
    router.push(`/${username}/sheets/${value}`)
  }

  return (
    <div className="flex justify-start items-center overflow-x-auto no-scrollbar">
      {['total', ...sheets].map((sheet) => (
        <button
          key={sheet}
          className={`w-[90px] px-8 py-3 text-sm text-gray-600 text-center ease-in duration-300 uppercase hover:bg-gray-100 ${
            tab === sheet ? 'border-b-2 border-gray-900' : ''
          }`}
          onClick={() => onClick(sheet)}
        >
          {sheet}
        </button>
      ))}
    </div>
  )
}
