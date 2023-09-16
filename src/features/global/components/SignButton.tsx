import { useState } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import {
  Button,
  MenuItem,
  Dialog,
  DialogContent,
  Snackbar,
  Alert,
} from '@mui/material'
import { SignInWithGoogleButton } from '@/components/button/SignInWithGoogleButton'
import Link from 'next/link'
import { Logo } from '@/components/icon/Logo'

interface Props {
  mobile: boolean
}

export const SignButton: React.FC<Props> = ({ mobile }) => {
  const [open, setOpen] = useState(false)
  const [snack, setSnack] = useState(false)
  const [pass, setPass] = useState('')
  const { data: session, status } = useSession()

  const onClick = () => {
    session ? signOut() : setOpen(true)
  }

  const handleInputPass = (event) => {
    setPass(event.target.value)
  }

  return (
    <>
      {mobile ? (
        <MenuItem onClick={onClick} sx={{ fontFamily: 'Nico Moji' }}>
          {session ? 'ログアウト' : 'ログイン'}
        </MenuItem>
      ) : (
        <Button
          onClick={onClick}
          sx={{
            my: 2,
            color: 'white',
            fontFamily: 'Nico Moji',
          }}
          endIcon={null}
        >
          {session ? 'ログアウト' : 'ログイン'}
        </Button>
      )}
      <Snackbar
        open={snack}
        autoHideDuration={1000}
        onClose={() => setSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnack(false)}
          severity={session ? 'success' : 'error'}
          elevation={6}
          variant="filled"
        >
          {session ? 'Login Success!' : 'Login Failed'}
        </Alert>
      </Snackbar>
      <Dialog open={open} onClose={() => setOpen(false)}>
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
    </>
  )
}
