import { useSession } from 'next-auth/react'
import { SearchResult } from '@/types/search'

interface ManualRegisterButtonProps {
  helpText: string
  searchQuery: string
  onSelectBook: (book: SearchResult) => void
}

export const ManualRegisterButton: React.FC<ManualRegisterButtonProps> = ({
  helpText,
  searchQuery,
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
      <a
        href={`https://www.amazon.co.jp/s?i=stripbooks&k=${encodeURIComponent(searchQuery.trim())}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 block rounded-md border border-gray-300 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        Amazonで検索
      </a>
    </div>
  )
}
