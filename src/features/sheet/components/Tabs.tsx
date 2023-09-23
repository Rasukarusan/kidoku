import { useState } from 'react'
import { useRouter } from 'next/router'
import { Tab, Tabs as MuiTabs } from '@mui/material'

interface Props {
  sheets: string[]
  value: string
  username: string
}
export const Tabs: React.FC<Props> = ({ value, sheets, username }) => {
  const [tab, setTab] = useState(value)
  const router = useRouter()
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue)
    router.push(`/${username}/sheets/${newValue}`)
  }

  return (
    <MuiTabs
      variant="scrollable"
      scrollButtons="auto"
      onChange={handleChange}
      aria-label="readgin records"
      value={tab}
    >
      <Tab label="total" value="total" />
      {sheets.map((sheet) => (
        <Tab key={sheet} label={sheet} value={sheet} />
      ))}
    </MuiTabs>
  )
}
