import useSWR from 'swr'
import { fetcher } from '@/libs/swr'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FaUser } from 'react-icons/fa'
import { twMerge } from 'tailwind-merge'
import { UserImageResponse } from '@/types/api'
import { Reorder } from 'framer-motion'

interface Props {
  sheets: string[]
  value: string
  username: string
}
export const Tabs: React.FC<Props> = ({ value, sheets, username }) => {
  const router = useRouter()
  const [tab, setTab] = useState(value)
  const [orderedSheets, setOrderedSheets] = useState(sheets)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  )

  const { data } = useSWR<UserImageResponse>(
    `/api/user/image?username=${username}`,
    fetcher
  )

  useEffect(() => {
    // 新しいシートが追加された場合のみ更新
    const newSheets = sheets.filter((sheet) => !orderedSheets.includes(sheet))
    const existingSheets = orderedSheets.filter((sheet) =>
      sheets.includes(sheet)
    )
    if (
      newSheets.length > 0 ||
      existingSheets.length !== orderedSheets.length
    ) {
      setOrderedSheets([...existingSheets, ...newSheets])
    }
  }, [sheets, orderedSheets])

  const onClick = (value: string) => {
    if (!draggedItem) {
      setTab(value)
      router.push(`/${username}/sheets/${value}`)
    }
  }

  const handleDragStart = (item: string) => {
    setDraggedItem(item)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  return (
    <div className="no-scrollbar flex items-center justify-start overflow-x-auto">
      <div className="flex items-center">
        {/* TOTAL tab - fixed position */}
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
              alt="user"
            />
          ) : (
            <FaUser className="mr-4" size={18} />
          )}
          <span className="mr-4">total</span>
        </button>

        {/* Other tabs - draggable */}
        <Reorder.Group
          as="div"
          axis="x"
          values={orderedSheets}
          onReorder={setOrderedSheets}
          className="flex items-center"
          style={{ listStyle: 'none' }}
          layoutScroll
        >
          {orderedSheets.map((item) => (
            <Reorder.Item
              key={item}
              value={item}
              className="relative"
              style={{ listStyle: 'none' }}
              whileDrag={{
                scale: 1.05,
                zIndex: 1,
                cursor: 'grabbing',
              }}
              onDragStart={() => handleDragStart(item)}
              onDragEnd={handleDragEnd}
              layoutId={item}
              transition={{
                type: 'spring',
                stiffness: 600,
                damping: 30,
              }}
            >
              <button
                className={twMerge(
                  'max-h-11 whitespace-nowrap px-8 py-3 text-center text-sm uppercase text-gray-600 duration-300 ease-in',
                  !draggedItem && 'hover:bg-gray-100',
                  tab === item
                    ? 'border-b-2 border-gray-900'
                    : 'border-b border-gray-200',
                  draggedItem === item && 'cursor-grabbing opacity-80'
                )}
                onClick={() => onClick(item)}
                onPointerDown={(e) => {
                  const target = e.currentTarget
                  const timer = setTimeout(() => {
                    if (target) {
                      target.style.cursor = 'grabbing'
                    }
                  }, 500)
                  setLongPressTimer(timer)
                }}
                onPointerUp={() => {
                  if (longPressTimer) {
                    clearTimeout(longPressTimer)
                    setLongPressTimer(null)
                  }
                }}
                onPointerLeave={() => {
                  if (longPressTimer) {
                    clearTimeout(longPressTimer)
                    setLongPressTimer(null)
                  }
                }}
              >
                {item}
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
    </div>
  )
}
