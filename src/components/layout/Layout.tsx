import { kosugi, notojp } from '@/libs/fonts'

interface Props {
  children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
  return (
    <div className={`${kosugi.variable} ${notojp.variable}`}>{children}</div>
  )
}
