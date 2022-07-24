import { Box } from '@mui/material'
import { Record } from '../types'

interface Props {
  info?: string
}

export const PopoverView: React.FC<Props> = ({ info }) => {
  if (!info) return null
  const book: Record = JSON.parse(info)
  return (
    <Box sx={{ p: 2 }}>
      <div>{book.title}</div>
      <div>{book.author}</div>
      <div>{book.category}</div>
    </Box>
  )
}
