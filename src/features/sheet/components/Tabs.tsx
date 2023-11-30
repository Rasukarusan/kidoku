import useSWR from 'swr'
import { fetcher } from '@/libs/swr'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/react'
import { FaUser } from 'react-icons/fa'

interface Props {
  sheets: string[]
  value: string
  username: string
}
export const Tabs: React.FC<Props> = ({ value, sheets, username }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [tab, setTab] = useState(value)
  const { data } = useSWR(`/api/user/image?username=${username}`, fetcher)

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
        {data?.image ? (
          <img
            src={data?.image}
            className="min-h-8 min-w-8 mr-4 h-8 w-8 rounded-full"
          />
        ) : (
          <FaUser className="mr-4" size={18} />
        )}
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
