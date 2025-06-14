import { AddModal } from '@/components/input/SearchBox/AddModal'
import { usePusher } from '@/hooks/usePusher'
import { SearchModal } from '../input/SearchBox/SearchModal'
import { LoginModal } from './LoginModal'
import { Sidebar } from './Sidebar'

interface Props {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  usePusher()

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col lg:ml-60">
        <SearchModal />
        <AddModal />
        <LoginModal />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
