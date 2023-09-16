import Link from 'next/link'
import { Typography } from '@mui/material'

export const TitleSp: React.FC = () => {
  return (
    <>
      <Link href="/" legacyBehavior>
        <Typography
          variant="h5"
          noWrap
          component="a"
          href="/"
          sx={{
            mr: 2,
            display: { xs: 'flex', md: 'none' },
            flexGrow: 1,
            fontFamily: 'Nico Moji',
            fontWeight: 700,
            letterSpacing: '.3rem',
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          Kidoku
        </Typography>
      </Link>
    </>
  )
}
