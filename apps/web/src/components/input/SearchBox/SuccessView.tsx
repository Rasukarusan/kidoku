import { useEffect } from 'react'
import { useReward } from 'react-rewards'
import { motion } from 'framer-motion'

interface SuccessViewProps {
  bookTitle: string
  bookImage?: string
  sheetName: string
  onGoToSheet: () => void
  onClose: () => void
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  bookTitle,
  bookImage,
  sheetName,
  onGoToSheet,
  onClose,
}) => {
  const { reward } = useReward('successRewardId', 'confetti', {
    elementCount: 160,
    spread: 80,
    startVelocity: 35,
    lifetime: 300,
  })

  useEffect(() => {
    const timer = setTimeout(() => reward(), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      {/* 本の表紙 */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="mb-6"
      >
        {bookImage && bookImage !== '/no-image.png' ? (
          <img
            src={bookImage}
            alt={bookTitle}
            className="h-[180px] rounded-md object-contain shadow-lg"
          />
        ) : (
          <div className="flex h-[180px] w-[120px] items-center justify-center rounded-md bg-gradient-to-br from-blue-100 to-blue-200 shadow-lg">
            <span className="px-2 text-center text-sm font-bold text-blue-600">
              {bookTitle}
            </span>
          </div>
        )}
      </motion.div>

      {/* メッセージ */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-2 text-center"
      >
        <div
          id="successRewardId"
          className="mb-3 text-2xl font-bold text-gray-800"
        >
          登録しました!
        </div>
        <p className="text-sm text-gray-500">
          『{bookTitle}』を「{sheetName}」に追加しました
        </p>
      </motion.div>

      {/* アクションボタン */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex w-full max-w-xs flex-col gap-3"
      >
        <button
          onClick={onGoToSheet}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
        >
          「{sheetName}」を見る
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          閉じる
        </button>
      </motion.div>
    </div>
  )
}
