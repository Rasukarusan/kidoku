import useSWR from 'swr'
import { fetcher } from '@/libs/swr'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { FaUser } from 'react-icons/fa'
import { twMerge } from 'tailwind-merge'

interface Props {
  sheets: string[]
  value: string
  username: string
}
export const Tabs: React.FC<Props> = ({ value, sheets, username }) => {
  const router = useRouter()
  const [tab, setTab] = useState(value)
  const { data } = useSWR(`/api/user/image?username=${username}`, fetcher)

  const onClick = (value: string) => {
    setTab(value)
    router.push(`/${username}/sheets/${value}`)
  }

  return (
    <div className="no-scrollbar flex items-center justify-start overflow-x-auto">
      <button
        className={twMerge(
          'flex max-h-11 items-center justify-between whitespace-nowrap px-8 py-3 text-center text-sm uppercase text-gray-600 duration-300 ease-in hover:bg-gray-100',
          tab === 'total'
            ? 'border-b-2 border-gray-900'
            : 'border-b border-gray-200'
        )}
        onClick={() => onClick('total')}
      >
        {data?.image ? (
          <img
            src={data?.image}
            className="mr-4 h-6 min-h-6 w-6 min-w-6 rounded-full"
          />
        ) : (
          <FaUser className="mr-4" size={18} />
        )}
        <span className="mr-4">total</span>
      </button>
      {sheets.map((sheet) => (
        <button
          key={sheet}
          className={twMerge(
            'max-h-11 whitespace-nowrap px-8 py-3 text-center text-sm uppercase text-gray-600 duration-300 ease-in hover:bg-gray-100',
            tab === sheet
              ? 'border-b-2 border-gray-900'
              : 'border-b border-gray-200 '
          )}
          onClick={() => onClick(sheet)}
        >
          {sheet}
        </button>
      ))}
    </div>
  )
}
