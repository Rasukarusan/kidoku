import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { SignInWithGoogleButton } from '@/components/button/SignInWithGoogleButton'
import { Logo } from '@/components/icon/Logo'
import { Modal } from '@/components/layout/Modal'

interface Props {
  open: boolean
  onClose: () => void
}

export const LoginModal: React.FC<Props> = ({ open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose} className="!h-auto !w-auto p-4">
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
        <div className="text-sm text-gray-400">
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
