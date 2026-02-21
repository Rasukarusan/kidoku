import { useRef, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { NextSeo } from 'next-seo'
import { useLazyQuery, useMutation } from '@apollo/client'
import {
  isNameAvailableQuery,
  updateUserNameMutation,
  deleteUserMutation,
} from '@/features/user/api'

interface Props {
  name: string
  image: string
}
export const ProfilePage: React.FC<Props> = ({ name, image }) => {
  const [currentName, setCurrentName] = useState(name)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const savedNameRef = useRef(name)

  const [checkNameAvailable] = useLazyQuery(isNameAvailableQuery)
  const [updateUserName] = useMutation(updateUserNameMutation)
  const [deleteUser] = useMutation(deleteUserMutation)

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setCurrentName(newName)
    setSaved(false)
    const { data } = await checkNameAvailable({
      variables: { input: { name: newName } },
    })
    setError(
      data?.isNameAvailable ? '' : 'すでに利用されているため登録できません'
    )
  }
  const onBlur = async () => {
    if (error || currentName === savedNameRef.current || !currentName) return
    await updateUserName({
      variables: { input: { name: currentName } },
    })
    savedNameRef.current = currentName
    setSaved(true)
  }

  const onClickDelete = async () => {
    const confirm = window.confirm('アカウントを削除してもよろしいですか？')
    if (!confirm) return
    const { data } = await deleteUser()
    if (data?.deleteUser) {
      location.href = '/'
    }
  }

  const onClickExportCSV = () => {
    window.open('/api/export/csv', '_blank')
  }

  return (
    <Container className="px-4 py-8 sm:px-10 sm:py-10">
      <NextSeo title="アカウント設定 | kidoku" />
      <h2 className="mb-6 text-2xl font-bold">設定</h2>

      {/* プロフィール */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-4 text-sm font-bold text-gray-700">プロフィール</h3>
        <div className="flex items-center gap-5">
          <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full">
            <img
              src={image}
              width={72}
              height={72}
              className="h-full w-full object-cover"
              alt="プロフィール画像"
            />
          </div>
          <div className="min-w-0 flex-1">
            <label className="mb-1 block text-xs text-gray-500">表示名</label>
            <input
              value={currentName}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              onChange={onChange}
              onBlur={onBlur}
            />
            <div className="mt-1 h-4 text-xs">
              {error && <span className="text-red-600">{error}</span>}
              {saved && <span className="text-green-600">保存しました</span>}
            </div>
          </div>
        </div>
      </section>

      {/* データエクスポート */}
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
        <h3 className="mb-1 text-sm font-bold text-gray-700">
          データエクスポート
        </h3>
        <p className="mb-4 text-xs text-gray-500">
          すべての読書記録をCSV形式でダウンロードできます。
        </p>
        <button
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          onClick={onClickExportCSV}
        >
          CSVでダウンロード
        </button>
      </section>

      {/* アカウント削除 */}
      <section className="rounded-lg border border-red-100 bg-red-50/40 p-6">
        <h3 className="mb-1 text-sm font-bold text-red-600">アカウント削除</h3>
        <p className="mb-4 text-xs text-gray-500">
          アカウントを削除すると登録されていたデータは全て削除され、復元できません。
        </p>
        <button
          className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
          onClick={onClickDelete}
        >
          アカウントを削除する
        </button>
      </section>
    </Container>
  )
}
