import { Tabs } from './Tabs'
import { Menu } from './Menu'

interface Props {
  sheets: Array<{ id: string; name: string; order: number }>
  currentSheet: string
  username: string
  menuActivate?: { edit: boolean; delete: boolean }
}

export const SheetTabsWithMenu: React.FC<Props> = ({
  sheets,
  currentSheet,
  username,
  menuActivate,
}) => {
  return (
    <div className="sticky top-[64px] z-30 -mx-4 flex items-center bg-white px-4 sm:-mx-6 sm:px-6">
      <Tabs sheets={sheets} value={currentSheet} username={username} />
      <Menu
        currentSheet={currentSheet}
        username={username}
        activate={menuActivate}
      />
    </div>
  )
}
