import { useState } from 'react'
import { Loading } from '@/components/icon/Loading'

interface Props {
  name: string
  image: string
}
export const ProfilePage: React.FC<Props> = ({ name, image }) => {
  const [currentName, setCurrentName] = useState(name)
  const [loading, setLoading] = useState(false)
  const onSubmit = async () => {
    setLoading(true)
    const res = await fetch(`/api/me`, {
      method: 'PUT',
      body: JSON.stringify({ name: currentName }),
      headers: {
        Accept: 'application/json',
      },
    })
    setLoading(false)
  }
  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold">Settings</h2>
      <div className="flex p-4 mb-8">
        <button className="rounded-full w-[100px] h-[100px] mr-8 mb-4">
          <img src={image} width={100} height={100} className="rounded-full" />
        </button>
        <div className="w-full">
          <div className="font-bold flex items-start mb-4">
            <span className="mr-1">表示名</span>
            <span className="font-bold text-red-400 text-xs">※</span>
          </div>
          <input
            value={currentName}
            className="p-2 border border-slate-200 rounded-md w-full bg-slate-100"
            onChange={(e) => {
              setCurrentName(e.target.value)
            }}
          />
        </div>
      </div>
      <button
        className="px-4 py-2 hover:bg-blue-500 bg-blue-400 font-bold rounded-md text-white block m-auto flex items-center"
        onClick={onSubmit}
      >
        {loading && (
          <Loading className="w-[18px] h-[18px] border-[3px] mr-2 border-white" />
        )}
        <span>更新する</span>
      </button>
      <div className="mt-60"></div>
    </div>
  )
}
