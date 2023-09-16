import Link from 'next/link'
import { Typography } from '@mui/material'

export const Title: React.FC = () => {
  return (
    <>
      <Link href="/" legacyBehavior>
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
            fontFamily: 'Nico Moji',
          }}
        >
          Kidoku
        </Typography>
      </Link>
    </>
  )
}
