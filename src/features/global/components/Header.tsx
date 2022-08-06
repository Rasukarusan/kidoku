import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import {
  Avatar,
  Box,
  IconButton,
  AppBar,
  Toolbar,
  Container,
} from '@mui/material'
import { Page } from '../types'
import { Title, TitleSp, Menu, MenuSp } from './'
import { theme } from '../theme'
import OpenInNewSharpIcon from '@mui/icons-material/OpenInNewSharp'
import GitHubIcon from '@mui/icons-material/GitHub'

const pages: Page[] = [
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
  const router = useRouter()
  return (
    <>
      <AppBar position="fixed" color="primary" sx={{ boxShadow: 'none' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Title />
            <MenuSp pages={pages} />
            <TitleSp />
            <Menu pages={pages} />
            <Box sx={{ flexGrow: 0 }}>
              <a
                href="https://github.com/Rasukarusan/search-author-neo"
                target="_blank"
                rel="noreferrer"
              >
                <IconButton sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <GitHubIcon fontSize="large" />
                  </Avatar>
                </IconButton>
              </a>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <div style={{ marginBottom: '70px' }}></div>
    </>
  )
}
