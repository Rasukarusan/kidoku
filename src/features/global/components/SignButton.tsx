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
import { SignInWithGithubButton } from '@/components/button/SignInWithGithubButton'

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
          <SignInWithGithubButton
            onClick={() => {
              signIn('github')
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
