import Link from 'next/link'
import { Typography } from '@mui/material'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'

export const Title: React.FC = () => {
  return (
    <>
      <AutoStoriesIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
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
    </>
  )
}
