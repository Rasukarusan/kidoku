import { useRouter } from 'next/router'
import dayjs from 'dayjs'
import { AppBar, Toolbar, Container } from '@mui/material'
import OpenInNewSharpIcon from '@mui/icons-material/OpenInNewSharp'
import { Page } from '../types'
import { Title, TitleSp, Menu, MenuSp } from './'

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
          </Toolbar>
        </Container>
      </AppBar>
      <div style={{ marginBottom: '70px' }}></div>
    </>
  )
}
