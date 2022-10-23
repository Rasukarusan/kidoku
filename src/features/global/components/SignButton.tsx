import { useRecoilState } from 'recoil'
import { useEffect, useState } from 'react'
import {
  Button,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material'
import { isLoginAtom } from '@/store/isLogin'
import {
  login as apiLogin,
  logout as apiLogout,
  auth as apiAuth,
} from '../util'

interface Props {
  mobile: boolean
}

export const SignButton: React.FC<Props> = ({ mobile }) => {
  const [open, setOpen] = useState(false)
  const [snack, setSnack] = useState(false)
  const [pass, setPass] = useState('')
  const [isLogin, setIsLogin] = useRecoilState(isLoginAtom)

  useEffect(() => {
    ;(async () => {
      const res = await apiAuth()
      setIsLogin(res)
    })()
  }, [])

  const login = async () => {
    const res = await apiLogin(pass)
    setIsLogin(res)
    setSnack(true)
    setOpen(false)
  }

  const logout = async () => {
    await apiLogout()
    setIsLogin(false)
  }

  const onClick = () => {
    isLogin ? logout() : setOpen(true)
  }

  const handleInputPass = (event) => {
    setPass(event.target.value)
  }

  return (
    <>
      {mobile ? (
        <MenuItem onClick={onClick} sx={{ fontFamily: 'Nico Moji' }}>
          {isLogin ? 'ログアウト' : 'ログイン'}
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
          {isLogin ? 'ログアウト' : 'ログイン'}
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
          severity={isLogin ? 'success' : 'error'}
          elevation={6}
          variant="filled"
        >
          {isLogin ? 'Login Success!' : 'Login Failed'}
        </Alert>
      </Snackbar>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogContent>
          <TextField
            autoFocus
            autoComplete="off"
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            variant="standard"
            onChange={handleInputPass}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                // ENTER
                login()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>キャンセル</Button>
          <Button onClick={login}>ログイン</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
