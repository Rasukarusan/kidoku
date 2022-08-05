import { ReactElement } from 'react'

export interface Page {
  title: string
  href: string
  target: string
  icon?: ReactElement
}
