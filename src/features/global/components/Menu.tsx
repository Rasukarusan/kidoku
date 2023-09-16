import Link from 'next/link'
import { Box, Button } from '@mui/material'
import { Page } from '../types'
import { useSession } from 'next-auth/react'

interface Props {
  pages: Page[]
}

export const Menu: React.FC<Props> = ({ pages }) => {
  const { data: session } = useSession()
  return (
    <>
      <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
        {pages.map((page) => {
          if (page.auth && !session) return null

          return (
            <Link
              href={page.href}
              key={page.title}
              style={{ textDecoration: 'none' }}
              target={page.target}
            >
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
            </Link>
          )
        })}
      </Box>
    </>
  )
}
