import { kosugi, notojp } from '@/libs/fonts'
import { AddModal } from '@/components/input/SearchBox/AddModal'
import { usePusher } from '@/hooks/usePusher'
import { SearchModal } from '../input/SearchBox/SearchModal'
import { LoginModal } from './LoginModal'

interface Props {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  usePusher()

  return (
    <div className={`${kosugi.variable} ${notojp.variable}`}>
      <SearchModal />
      <AddModal />
      <LoginModal />
      {children}
    </div>
  )
}
