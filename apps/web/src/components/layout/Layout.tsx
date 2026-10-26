import { useRouter } from 'next/router'
import { useUiMode } from '@/features/ui-mode/UiModeProvider'
import { SearchModal } from '../input/SearchBox/SearchModal'
import { LoginModal } from './LoginModal'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface Props {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  const { mode } = useUiMode()
  const router = useRouter()
  const cli = mode === 'cli' && router.pathname.includes('/sheets/')
  return (
    <div className="flex">
      {!cli && <Sidebar />}
      <div className="flex min-h-screen flex-1 flex-col overflow-x-hidden">
        <SearchModal />
        <LoginModal />
        <main className={cli ? 'flex-1' : 'flex-1 pb-14'}>{children}</main>
        {!cli && <BottomNav />}
      </div>
    </div>
  )
}
