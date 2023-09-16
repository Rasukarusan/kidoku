import { useRouter } from 'next/router'
import { AppBar, Toolbar, Container } from '@mui/material'
import { Page } from '../types'
import { Title, TitleSp, Menu, MenuSp } from './'
import { useSession } from 'next-auth/react'
import { LoginModal } from './LoginModal'
import { useState } from 'react'

const pages: Page[] = [
  {
    title: 'どくしょきろく',
    href: '/sheet',
    target: '',
    icon: null,
    auth: false,
  },
]

// レスポンシブヘッダー
export const Header = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  return (
    <>
      <AppBar position="fixed" color="primary" sx={{ boxShadow: 'none' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Title />
            <MenuSp pages={pages} />
            <TitleSp />
            <Menu pages={pages} />
            {session ? (
              <button className="rounded-full bg-gray-200 w-[40px] h-[40px] mr-4">
                <img
                  src={session.user.image}
                  alt="ユーザーアイコン"
                  width="40"
                  height="40"
                  className="rounded-full"
                />
              </button>
            ) : (
              <>
                <button
                  className="rounded-md bg-[#4f5b62] text-sm px-5 py-2 font-bold"
                  onClick={() => setOpen(true)}
                >
                  ログイン
                </button>
                <LoginModal open={open} onClose={() => setOpen(false)} />
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <div style={{ marginBottom: '70px' }}></div>
    </>
  )
}
