import { useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'

interface Props {
  sheets: string[]
  value: string
  username: string
}
export const Tabs: React.FC<Props> = ({ value, sheets, username }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [tab, setTab] = useState(value)

  const onClick = (value: string) => {
    setTab(value)
    router.push(`/${username}/sheets/${value}`)
  }

  return (
    <div className="no-scrollbar flex items-center justify-start overflow-x-auto">
      <button
        className={`flex max-h-11 items-center justify-between whitespace-nowrap px-8 py-3 text-center text-sm uppercase text-gray-600 duration-300 ease-in hover:bg-gray-100 ${
          tab === 'total'
            ? 'border-b-2 border-gray-900'
            : 'border-b border-gray-200'
        }`}
        onClick={() => onClick('total')}
      >
        <img
          src="https://lh3.googleusercontent.com/a/ACg8ocJT-LCACb3glXijA-jQa27gYGIy3yRnsSo1TenXA833urs=s96-c"
          className="mr-4 h-8 w-8 rounded-full"
        />
        total
      </button>
      {sheets.map((sheet) => (
        <button
          key={sheet}
          className={`max-h-11 whitespace-nowrap px-8 py-3 text-center text-sm uppercase text-gray-600 duration-300 ease-in hover:bg-gray-100 ${
            tab === sheet
              ? 'border-b-2 border-gray-900'
              : 'border-b border-gray-200 '
          }`}
          onClick={() => onClick(sheet)}
        >
          {sheet}
        </button>
      ))}
    </div>
  )
}
