import { useSession } from 'next-auth/react'
import { useSetAtom } from 'jotai'
import { openLoginModalAtom } from '@/store/modal/atom'
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
  const setOpenLoginModal = useSetAtom(openLoginModalAtom)

  const handleManualRegister = () => {
    if (!session) {
      setOpenLoginModal(true)
      return
    }
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
        className="w-full rounded-md bg-green-600 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:bg-gray-400"
        onClick={handleManualRegister}
        disabled={!session}
      >
        {session ? '手動で登録' : 'ログインしてください'}
      </button>
      <p className="mt-2 text-center text-xs text-gray-500">{helpText}</p>
    </div>
  )
}
