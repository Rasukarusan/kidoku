import { useState } from 'react'
import Link from 'next/link'
import dayjs from 'dayjs'
import { makeStyles } from '@mui/styles'
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
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

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }
  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  return (
    <AppBar position="static" color="primary" sx={{ boxShadow: 'none' }}>
      <Container maxWidth="xl">
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
              <Link href={page.href}>
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
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
