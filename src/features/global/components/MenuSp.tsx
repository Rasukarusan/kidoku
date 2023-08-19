import Link from 'next/link'
import { useRecoilValue } from 'recoil'
import { useState } from 'react'
import { Box, IconButton, Menu, MenuItem } from '@mui/material'
import { Page } from '../types'
import { SignButton } from './'
import MenuIcon from '@mui/icons-material/Menu'
import { isLoginAtom } from '@/store/isLogin'

interface Props {
  pages: Page[]
}

export const MenuSp: React.FC<Props> = ({ pages }) => {
  const isLogin = useRecoilValue(isLoginAtom)
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null)

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget)
  }

  const handleCloseNavMenu = () => {
    setAnchorElNav(null)
  }

  return (
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
        {pages.map((page) => {
          if (page.auth && !isLogin) return null

          return (
            <MenuItem key={page.title} onClick={handleCloseNavMenu}>
              <Link
                href={page.href}
                style={{
                  textDecoration: 'none',
                  fontFamily: 'Nico Moji ',
                }}
                target={page.target}
              >
                {page.title}
              </Link>
            </MenuItem>
          )
        })}
        <SignButton mobile={true} />
      </Menu>
    </Box>
  )
}
