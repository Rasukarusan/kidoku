import useSWR from 'swr'
import { fetcher } from '@/libs/swr'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { FaUser } from 'react-icons/fa'
import { twMerge } from 'tailwind-merge'
import { UserImageResponse } from '@/types/api'
import { Reorder } from 'framer-motion'
import { useMutation } from '@apollo/client'
import { UPDATE_SHEET_ORDERS } from '@/libs/apollo/queries'
import { useSession } from 'next-auth/react'
import { useMediaQuery } from 'react-responsive'

interface Props {
  sheets: Array<{ id: string; name: string; order: number }>
  value: string
  username: string
  userId: string
}
export const Tabs: React.FC<Props> = ({ value, sheets, username, userId }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const [tab, setTab] = useState(value)
  const [orderedSheets, setOrderedSheets] = useState(
    sheets.map((sheet) => sheet.name)
  )
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [updateSheetOrders] = useMutation(UPDATE_SHEET_ORDERS)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(
    null
  )
  const isMine = session && session.user.id === userId
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const canDrag = isMine && !isMobile

  const { data } = useSWR<UserImageResponse>(
    `/api/user/image?username=${username}`,
    fetcher
  )

  useEffect(() => {
    // 新しいシートが追加された場合のみ更新
    const sheetNames = sheets.map((sheet) => sheet.name)
    const newSheets = sheetNames.filter(
      (sheet) => !orderedSheets.includes(sheet)
    )
    const existingSheets = orderedSheets.filter((sheet) =>
      sheetNames.includes(sheet)
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

  const handleReorder = async (newOrder: string[]) => {
    setOrderedSheets(newOrder)

    try {
      const sheetOrderUpdates = newOrder
        .map((sheetName, index) => {
          const sheet = sheets.find((s) => s.name === sheetName)
          return {
            id: sheet?.id || '',
            order: newOrder.length - index,
          }
        })
        .filter((update) => update.id !== '')

      await updateSheetOrders({
        variables: {
          input: {
            sheets: sheetOrderUpdates,
          },
        },
      })
    } catch (error) {
      console.error('Failed to update sheet orders:', error)
    }
  }

  return (
    <div className="no-scrollbar mobile-tab-scroll flex items-center justify-start overflow-x-auto">
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

        {/* Other tabs - draggable only for owner */}
        <Reorder.Group
          as="div"
          axis="x"
          values={orderedSheets}
          onReorder={canDrag ? handleReorder : () => {}}
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
              whileDrag={
                canDrag
                  ? {
                      scale: 1.05,
                      zIndex: 1,
                      cursor: 'grabbing',
                    }
                  : {}
              }
              onDragStart={canDrag ? () => handleDragStart(item) : undefined}
              onDragEnd={canDrag ? handleDragEnd : undefined}
              layoutId={item}
              transition={{
                type: 'spring' as const,
                stiffness: 600,
                damping: 30,
              }}
              drag={canDrag ? 'x' : false}
            >
              <button
                className={twMerge(
                  'max-h-11 whitespace-nowrap px-8 py-3 text-center text-sm uppercase text-gray-600 duration-300 ease-in',
                  !draggedItem && 'hover:bg-gray-100',
                  tab === item
                    ? 'border-b-2 border-gray-900'
                    : 'border-b border-gray-200',
                  draggedItem === item && 'cursor-grabbing opacity-80',
                  !isMine && 'cursor-default'
                )}
                onClick={() => onClick(item)}
                onPointerDown={
                  canDrag
                    ? (e) => {
                        const target = e.currentTarget
                        const timer = setTimeout(() => {
                          if (target) {
                            target.style.cursor = 'grabbing'
                          }
                        }, 500)
                        setLongPressTimer(timer)
                      }
                    : undefined
                }
                onPointerUp={
                  canDrag
                    ? () => {
                        if (longPressTimer) {
                          clearTimeout(longPressTimer)
                          setLongPressTimer(null)
                        }
                      }
                    : undefined
                }
                onPointerLeave={
                  canDrag
                    ? () => {
                        if (longPressTimer) {
                          clearTimeout(longPressTimer)
                          setLongPressTimer(null)
                        }
                      }
                    : undefined
                }
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
