import { useEffect, useState } from 'react'
import { AiOutlineFileAdd } from 'react-icons/ai'
import { SheetAddModal } from '@/features/sheet/components/SheetAddModal'

interface Sheet {
  id: number
  name: string
}

interface SheetCheckAndRetryProps {
  sheets: Sheet[]
  refetchSheets: () => Promise<unknown>
  status: 'loading' | 'authenticated' | 'unauthenticated'
  isRevalidating?: boolean
}

/**
 * シート取得のリトライ機能付きボタン
 * コールドスタート時でもユーザー体験を改善
 */
export const SheetCheckAndRetry: React.FC<SheetCheckAndRetryProps> = ({
  sheets,
  refetchSheets,
  status,
  isRevalidating = false,
}) => {
  const [openAdd, setOpenAdd] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  // 認証済みだがシートが0の場合、自動でリトライ
  useEffect(() => {
    const checkSheets = async () => {
      if (status === 'authenticated' && sheets.length === 0 && retryCount < 3) {
        setIsRetrying(true)

        // 少し待ってからリトライ（バックエンドの起動を待つ）
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1))
        )

        try {
          await refetchSheets()
          setRetryCount((prev) => prev + 1)
        } catch (error) {
          console.error('Sheet refetch failed:', error)
        } finally {
          setIsRetrying(false)
        }
      }
    }

    checkSheets()
  }, [status, sheets.length, retryCount, refetchSheets])

  // シートが取得できた場合
  if (sheets.length > 0) {
    return null // 親コンポーネントでセレクトボックスを表示
  }

  // リトライ中の表示
  if (isRetrying || isRevalidating) {
    return (
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
        <span>シート情報を取得中...</span>
      </div>
    )
  }

  // シート追加ボタン
  return (
    <>
      <SheetAddModal
        open={openAdd}
        onClose={() => {
          setOpenAdd(false)
          refetchSheets()
          setRetryCount(0) // リトライカウントをリセット
        }}
      />
      <button
        className="mx-auto flex items-center justify-center whitespace-nowrap rounded-md bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600 disabled:bg-gray-500"
        onClick={() => {
          // ボタンクリック時に再度シート取得を試みる
          if (status === 'authenticated') {
            refetchSheets().then(() => {
              // シートが取得できなければモーダルを開く
              if (sheets.length === 0) {
                setOpenAdd(true)
              }
            })
          } else {
            setOpenAdd(true)
          }
        }}
        disabled={status === 'unauthenticated'}
      >
        <AiOutlineFileAdd className="mr-1 h-[24px] w-[24px] text-white" />
        {status === 'authenticated' ? 'シートを追加' : 'ログインしてください'}
      </button>
    </>
  )
}
