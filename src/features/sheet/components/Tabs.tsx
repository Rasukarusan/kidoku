import { useState } from 'react'
import { useRouter } from 'next/router'
import { Tab, Tabs as MuiTabs } from '@mui/material'
import { getYears } from '../util'

interface Props {
  value: string
}
export const Tabs: React.FC<Props> = ({ value }) => {
  const [tab, setTab] = useState(value)
  const router = useRouter()
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTab(newValue)
    router.push(`/sheet/${newValue}`)
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
      {getYears()
        .reverse()
        .map((year) => (
          <Tab key={year} label={year} value={year} />
        ))}
    </MuiTabs>
  )
}
