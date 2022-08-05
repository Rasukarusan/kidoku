import { useEffect, useState } from 'react'
import {
  Button,
  MenuItem,
  Dialog,
  DialogContent,
  TextField,
  DialogActions,
} from '@mui/material'

interface Props {
  mobile: boolean
}

export const SignButton: React.FC<Props> = ({ mobile }) => {
  const [open, setOpen] = useState(false)
  const [pass, setPass] = useState('')
  const [auth, setAuth] = useState(false)

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((res) => {
        setAuth(res)
      })
  }, [])

  // TODO: refactor
  const login = () => {
    fetch(`/api/login?pass=${pass}`, { method: 'POST' })
      .then((res) => {
        fetch(`/api/auth`)
          .then((res) => res.json())
          .then((res) => {
            setAuth(res)
          })
      })
      .finally(() => {
        setOpen(false)
      })
  }

  // TODO: refactor
  const logout = () => {
    fetch(`/api/logout`, { method: 'POST' }).then((res) => {
      fetch(`/api/auth`)
        .then((res) => res.json())
        .then((res) => {
          setAuth(res)
        })
    })
  }

  const onClick = () => {
    if (auth) {
      logout()
    } else {
      setOpen(true)
    }
  }

  const handleInputPass = (event) => {
    setPass(event.target.value)
  }

  return (
    <>
      {mobile ? (
        <MenuItem onClick={onClick}>
          {auth ? 'ログアウト' : 'ログイン'}
        </MenuItem>
      ) : (
        <Button
          onClick={onClick}
          sx={{
            my: 2,
            color: 'white',
            fontFamily: 'Stick-Regular',
          }}
          endIcon={null}
        >
          {auth ? 'ログアウト' : 'ログイン'}
        </Button>
      )}
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
