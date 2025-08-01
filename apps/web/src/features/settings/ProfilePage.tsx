import { useState } from 'react'
import { Loading } from '@/components/icon/Loading'
import { Container } from '@/components/layout/Container'
import { NextSeo } from 'next-seo'

interface Props {
  name: string
  image: string
}
export const ProfilePage: React.FC<Props> = ({ name, image }) => {
  const [currentName, setCurrentName] = useState(name)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setCurrentName(newName)
    const res = await fetch(`/api/check/name`, {
      method: 'POST',
      body: JSON.stringify({ name: newName }),
      headers: {
        Accept: 'application/json',
      },
    }).then((res) => res.json())
    setError(res.result ? '' : 'すでに利用されているため登録できません')
  }
  const onSubmit = async () => {
    setLoading(true)
    await fetch(`/api/me`, {
      method: 'PUT',
      body: JSON.stringify({ name: currentName }),
      headers: {
        Accept: 'application/json',
      },
    })
    setLoading(false)
  }

  const onClickDelete = async () => {
    const confirm = window.confirm('アカウントを削除してもよろしいですか？')
    if (!confirm) return
    const res: { result: boolean } = await fetch('/api/user', {
      method: 'DELETE',
    }).then((res) => res.json())
    if (res.result) {
      location.href = '/'
    }
  }

  const onClickExportCSV = () => {
    window.open('/api/export/csv', '_blank')
  }

  return (
    <Container className="p-10">
      <NextSeo title="アカウント設定 | kidoku" />
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="mb-8 flex p-4">
        <button className="mb-4 mr-8 h-[100px] w-[100px] rounded-full" disabled>
          <img src={image} width={100} height={100} className="rounded-full" />
        </button>
        <div className="w-full">
          <div className="mb-4 flex items-start font-bold">
            <span className="mr-1 text-sm text-gray-700">表示名</span>
            <span className="text-xs font-bold text-red-400">※</span>
          </div>
          <input
            value={currentName}
            className="mb-2 w-full rounded-md border border-slate-200 bg-slate-100 p-2"
            onChange={onChange}
          />
          <div className="mb-4 text-xs text-red-700">{error}</div>
          <div className="mb-4">
            <div className="mb-4 text-sm font-bold text-gray-700">
              データエクスポート
            </div>
            <button
              className="mb-2 rounded-md bg-green-500 px-4 py-2 text-sm font-bold text-white hover:bg-green-600"
              onClick={onClickExportCSV}
            >
              読書記録をCSVでダウンロード
            </button>
            <div className="mb-6 text-xs text-gray-600">
              ※すべての読書記録をCSV形式でダウンロードできます。
            </div>
          </div>
          <div className="mb-4">
            <div className="mb-4 text-sm font-bold text-gray-700">
              アカウント削除
            </div>
            <button
              className="mb-2 rounded-md text-sm font-bold text-red-500"
              onClick={onClickDelete}
            >
              アカウントを削除する
            </button>
            <div className="text-xs text-gray-600">
              ※アカウントを削除すると登録されていたデータは全て削除され、復元できませんのでご注意ください。
            </div>
          </div>
        </div>
      </div>
      <button
        className="m-auto block flex items-center rounded-md bg-blue-400 px-4 py-2 font-bold text-white hover:bg-blue-500 disabled:bg-gray-400"
        onClick={onSubmit}
        disabled={error !== ''}
      >
        {loading && (
          <Loading className="mr-2 h-[18px] w-[18px] border-[3px] border-white" />
        )}
        <span>更新する</span>
      </button>
      <div className="mt-60"></div>
    </Container>
  )
}
