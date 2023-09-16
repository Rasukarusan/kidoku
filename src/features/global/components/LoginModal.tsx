import { signIn } from 'next-auth/react'
import { Dialog, DialogContent } from '@mui/material'
import { SignInWithGoogleButton } from '@/components/button/SignInWithGoogleButton'
import Link from 'next/link'
import { Logo } from '@/components/icon/Logo'

interface Props {
  open: boolean
  onClose: () => void
}

export const LoginModal: React.FC<Props> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent dividers>
        <div className="text-center">
          <Link href="/" legacyBehavior>
            <div className="font-['Nico_Moji'] font-bold text-2xl tracking-[.3rem] flex items-center justify-center">
              <Logo className="w-5 mr-2" />
              Kidoku
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
            <Link href="" className="underline" target="_blank">
              利用規約
            </Link>
            、
            <Link href="" className="underline" target="_blank">
              プライバシーポリシー
            </Link>
            に同意したうえでログインしてください。
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
