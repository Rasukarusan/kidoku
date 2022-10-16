import Link from 'next/link'
import { Box, Button } from '@mui/material'
import { Page } from '../types'
import { SignButton } from './SignButton'
import { useRecoilValue } from 'recoil'
import { isLoginAtom } from '@/store/isLogin'

interface Props {
  pages: Page[]
}

export const Menu: React.FC<Props> = ({ pages }) => {
  const isLogin = useRecoilValue(isLoginAtom)
  return (
    <>
      <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
        {pages.map((page) => {
          if (page.auth && !isLogin) return null

          return (
            <Link href={page.href} key={page.title}>
              <a style={{ textDecoration: 'none' }} target={page.target}>
                <Button
                  key={page.title}
                  sx={{
                    my: 2,
                    color: 'white',
                    fontFamily: 'Nico Moji',
                  }}
                  endIcon={page.icon}
                >
                  {page.title}
                </Button>
              </a>
            </Link>
          )
        })}
        <SignButton mobile={false} />
      </Box>
    </>
  )
}
