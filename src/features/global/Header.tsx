import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import dayjs from 'dayjs'
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  DialogActions,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import OpenInNewSharpIcon from '@mui/icons-material/OpenInNewSharp'

const pages = [
  {
    title: '読書記録',
    href: '/sheet/' + dayjs().format('YYYY'),
    target: '',
    icon: null,
  },
  {
    title: 'シート',
    href: 'https://docs.google.com/spreadsheets/d/1AgAMtzU1xFYfV5OueYkA6MDSNIgjVOHG39CRdKYcVFA/edit#gid=789903411',
    target: '_blank',
    icon: <OpenInNewSharpIcon />,
  },
]

// レスポンシブヘッダー
export const Header = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)
  const [open, setOpen] = useState(false)
  const [pass, setPass] = useState('')
  const [auth, setAuth] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((res) => {
        setAuth(res)
      })
  }, [])

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  const handleInputPass = (event) => {
    setPass(event.target.value)
  }

  // TODO: refactor
  const handleClickLogin = () => {
    fetch(`/api/hash?pass=${pass}`)
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
  const handleClickLogout = () => {
    fetch(`/api/logout`).then((res) => {
      fetch(`/api/auth`)
        .then((res) => res.json())
        .then((res) => {
          setAuth(res)
        })
    })
  }

  return (
    <>
      <AppBar position="fixed" color="primary" sx={{ boxShadow: 'none' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <AutoStoriesIcon
              sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
            />
            <Link href="/">
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/"
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                  fontFamily: 'Stick-Regular',
                }}
              >
                著者検索neo
              </Typography>
            </Link>

            {/* スマホ用ハンバーガーメニュー  */}
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.title} onClick={handleCloseNavMenu}>
                    <Link href={page.href}>
                      <a
                        style={{
                          textDecoration: 'none',
                          fontFamily: 'Stick-Regular ',
                        }}
                        target={page.target}
                      >
                        {page.title}
                      </a>
                    </Link>
                  </MenuItem>
                ))}
                {auth ? (
                  <MenuItem onClick={handleClickLogout}>ログアウト</MenuItem>
                ) : (
                  <MenuItem onClick={handleClickLogout}>ログイン</MenuItem>
                )}
              </Menu>
            </Box>
            {/* end スマホ用ハンバーガーメニュー  */}

            <AutoStoriesIcon
              sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
            />
            <Link href="/">
              <Typography
                variant="h5"
                noWrap
                component="a"
                href="/"
                sx={{
                  mr: 2,
                  display: { xs: 'flex', md: 'none' },
                  flexGrow: 1,
                  fontFamily: 'Stick-Regular',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                著者検索neo
              </Typography>
            </Link>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Link href={page.href} key={page.title}>
                  <a style={{ textDecoration: 'none' }} target={page.target}>
                    <Button
                      key={page.title}
                      onClick={handleCloseNavMenu}
                      sx={{
                        my: 2,
                        color: 'white',
                        fontFamily: 'Stick-Regular',
                      }}
                      endIcon={page.icon}
                    >
                      {page.title}
                    </Button>
                  </a>
                </Link>
              ))}
              {auth ? (
                <Button
                  onClick={handleClickLogout}
                  sx={{
                    my: 2,
                    color: 'white',
                    fontFamily: 'Stick-Regular',
                  }}
                  endIcon={null}
                >
                  ログアウト
                </Button>
              ) : (
                <Button
                  onClick={() => setOpen(true)}
                  sx={{
                    my: 2,
                    color: 'white',
                    fontFamily: 'Stick-Regular',
                  }}
                  endIcon={null}
                >
                  ログイン
                </Button>
              )}
            </Box>
          </Toolbar>
          <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogContent>
              <TextField
                autoFocus
                autoComplete="off"
                margin="dense"
                id="password"
                type="password"
                fullWidth
                variant="standard"
                onChange={handleInputPass}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleClickLogin}>Login</Button>
            </DialogActions>
          </Dialog>
        </Container>
      </AppBar>
      <div style={{ marginBottom: '70px' }}></div>
    </>
  )
}
