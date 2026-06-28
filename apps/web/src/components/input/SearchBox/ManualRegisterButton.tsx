import { useSession } from 'next-auth/react'
import { SearchResult } from '@/types/search'

interface ManualRegisterButtonProps {
  helpText: string
  onSelectBook: (book: SearchResult) => void
}

export const ManualRegisterButton: React.FC<ManualRegisterButtonProps> = ({
  helpText,
  onSelectBook,
}) => {
  const { data: session } = useSession()

  // 未ログイン時はボタン・補足文ともに表示しない
  if (!session) return null

  const handleManualRegister = () => {
    onSelectBook({
      id: '',
      title: '',
      author: '',
      image: '/no-image.png',
      category: '-',
      memo: '',
    })
  }

  return (
    <div>
      <button
        className="w-full rounded-md bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700"
        onClick={handleManualRegister}
      >
        手動で登録
      </button>
      <p className="mt-2 text-center text-xs text-gray-500">{helpText}</p>
    </div>
  )
}
