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
  const [isDragModeEnabled, setIsDragModeEnabled] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const isMine = session && session.user.id === userId

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

  // モバイル判定
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

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
    // モバイルでドラッグ終了後、ドラッグモードを無効にする
    if (isMobile && isDragModeEnabled) {
      setTimeout(() => {
        setIsDragModeEnabled(false)
      }, 1000) // 1秒後に自動的にドラッグモードを終了
    }
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

  const handleLongPressStart = (_item: string) => {
    if (!isMine) return

    const timer = setTimeout(() => {
      if (isMobile) {
        setIsDragModeEnabled(true)
        // 触覚フィードバック（対応ブラウザのみ）
        if (navigator.vibrate) {
          navigator.vibrate(100)
        }
      }
    }, 3000) // 3秒

    setLongPressTimer(timer)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  // ドラッグ可能判定
  const isDraggable = isMine && (!isMobile || isDragModeEnabled)

  return (
    <div className="relative">
      {/* ドラッグモード有効時の通知 */}
      {isMobile && isDragModeEnabled && (
        <div className="absolute left-0 right-0 top-0 z-10 bg-blue-100 px-4 py-2 text-center text-sm text-blue-800">
          ドラッグモードが有効です。タブをドラッグして並び替えできます。
        </div>
      )}
      <div
        className={twMerge(
          'no-scrollbar mobile-tab-scroll flex items-center justify-start overflow-x-auto',
          isMobile && isDragModeEnabled && 'mt-10'
        )}
      >
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
            onReorder={isDraggable ? handleReorder : () => {}}
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
                  isDraggable
                    ? {
                        scale: 1.05,
                        zIndex: 1,
                        cursor: 'grabbing',
                      }
                    : {}
                }
                onDragStart={
                  isDraggable ? () => handleDragStart(item) : undefined
                }
                onDragEnd={isDraggable ? handleDragEnd : undefined}
                layoutId={item}
                transition={{
                  type: 'spring',
                  stiffness: 600,
                  damping: 30,
                }}
                drag={isDraggable ? 'x' : false}
              >
                <button
                  className={twMerge(
                    'max-h-11 whitespace-nowrap px-8 py-3 text-center text-sm uppercase text-gray-600 duration-300 ease-in',
                    !draggedItem && 'hover:bg-gray-100',
                    tab === item
                      ? 'border-b-2 border-gray-900'
                      : 'border-b border-gray-200',
                    draggedItem === item && 'cursor-grabbing opacity-80',
                    !isDraggable && 'cursor-default',
                    isMobile &&
                      isDragModeEnabled &&
                      'border-blue-200 bg-blue-50'
                  )}
                  onClick={() => onClick(item)}
                  onPointerDown={
                    isMine ? () => handleLongPressStart(item) : undefined
                  }
                  onPointerUp={isMine ? handleLongPressEnd : undefined}
                  onPointerLeave={isMine ? handleLongPressEnd : undefined}
                >
                  {item}
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>
    </div>
  )
}