import Link from 'next/link'
import { Box, Button } from '@mui/material'
import { Page } from '../types'
import { SignButton } from './SignButton'

interface Props {
  pages: Page[]
}

export const Menu: React.FC<Props> = ({ pages }) => {
  return (
    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
      {pages.map((page) => (
        <Link href={page.href} key={page.title}>
          <a style={{ textDecoration: 'none' }} target={page.target}>
            <Button
              key={page.title}
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
      <SignButton mobile={false} />
    </Box>
  )
}
