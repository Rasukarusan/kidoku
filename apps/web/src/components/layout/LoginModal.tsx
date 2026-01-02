import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { SignInWithGoogleButton } from '@/components/button/SignInWithGoogleButton'
import { Logo } from '@/components/icon/Logo'
import { Modal } from '@/components/layout/Modal'
import { useAtom } from 'jotai'
import { openLoginModalAtom } from '@/store/modal/atom'

// 裏口ログインが有効かどうか
const isBackdoorEnabled =
  process.env.NEXT_PUBLIC_ENABLE_BACKDOOR_LOGIN === 'true'

export const LoginModal: React.FC = () => {
  const [open, setOpen] = useAtom(openLoginModalAtom)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleBackdoorLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('backdoor', {
      email,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('メールアドレスが正しくありません')
    } else {
      setOpen(false)
      window.location.reload()
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      className="!h-auto !w-auto p-4"
    >
      <div className="text-center">
        <Link href="/" legacyBehavior>
          <div className="flex items-center justify-center font-['Nico_Moji'] text-2xl font-bold tracking-[.3rem]">
            <Logo className="mr-2 w-5" />
            kidoku
          </div>
        </Link>
        <div className="my-6">
          <SignInWithGoogleButton
            className="mx-auto my-0"
            onClick={() => {
              signIn('google')
            }}
          />
        </div>
        {isBackdoorEnabled && (
          <div className="mt-4 border-t pt-4">
            <div className="mb-3 text-sm text-gray-500">または</div>
            <form onSubmit={handleBackdoorLogin} className="space-y-3">
              <input
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border px-3 py-2 text-sm"
                required
              />
              {error && <div className="text-sm text-red-500">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
              >
                {loading ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>
          </div>
        )}
        <div className="mt-4 text-sm text-gray-400">
          <Link href="/terms" className="underline" target="_blank">
            利用規約
          </Link>
          、
          <Link href="/privacy" className="underline" target="_blank">
            プライバシーポリシー
          </Link>
          に同意したうえでログインしてください。
        </div>
      </div>
    </Modal>
  )
}
