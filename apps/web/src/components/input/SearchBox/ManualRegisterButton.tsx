import { useSession } from 'next-auth/react'
import { useSetAtom } from 'jotai'
import { openAddModalAtom, openLoginModalAtom } from '@/store/modal/atom'
import { addBookAtom } from '@/store/book/atom'

interface ManualRegisterButtonProps {
  helpText: string
}

export const ManualRegisterButton: React.FC<ManualRegisterButtonProps> = ({
  helpText,
}) => {
  const { data: session } = useSession()
  const setOpenLoginModal = useSetAtom(openLoginModalAtom)
  const setOpenAddModal = useSetAtom(openAddModalAtom)
  const setBook = useSetAtom(addBookAtom)

  const handleManualRegister = () => {
    if (!session) {
      setOpenLoginModal(true)
      return
    }
    // 空の本情報を設定してAddModalを開く
    setBook({
      id: '',
      title: '',
      author: '',
      image: '/no-image.png',
      category: '-',
      memo: '',
    })
    setOpenAddModal(true)
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
