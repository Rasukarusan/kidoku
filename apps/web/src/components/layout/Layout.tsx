import { AddModal } from '@/components/input/SearchBox/AddModal'
import { usePusher } from '@/hooks/usePusher'
import { SearchModal } from '../input/SearchBox/SearchModal'
import { LoginModal } from './LoginModal'
import { Sidebar } from './Sidebar'
import { useSession } from 'next-auth/react'
import { twMerge } from 'tailwind-merge'

interface Props {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  usePusher()
  const { data: session } = useSession()

  return (
    <div className="flex">
      <Sidebar />
      <div
        className={twMerge(
          'flex min-h-screen flex-1 flex-col',
          session && 'lg:ml-60'
        )}
      >
        <SearchModal />
        <AddModal />
        <LoginModal />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
