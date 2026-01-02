import { Tabs } from './Tabs'
import { Menu } from './Menu'

interface Props {
  sheets: Array<{ id: string; name: string; order: number }>
  currentSheet: string
  username: string
  userId: string
  menuActivate?: { edit: boolean; delete: boolean }
  variant?: 'sticky' | 'simple'
}

export const SheetTabsWithMenu: React.FC<Props> = ({
  sheets,
  currentSheet,
  username,
  userId,
  menuActivate,
  variant = 'sticky',
}) => {
  const containerClass =
    variant === 'simple'
      ? 'mb-8 flex items-center border-b border-gray-200'
      : 'sticky top-[3.5rem] z-30 -mx-4 flex items-center bg-white px-4 sm:-mx-6 sm:px-6'

  return (
    <div className={containerClass}>
      <Tabs
        sheets={sheets}
        value={currentSheet}
        username={username}
        userId={userId}
      />
      <Menu
        currentSheet={currentSheet}
        username={username}
        userId={userId}
        activate={menuActivate}
      />
    </div>
  )
}
