import { Box } from '@mui/material'
import { Record } from '../types'

interface Props {
  info: string | undefined
  isAuth: boolean
}

export const PopoverView: React.FC<Props> = ({ info, isAuth }) => {
  if (!info) return null
  const book: Record = JSON.parse(info)
  return (
    <Box sx={{ p: 2, width: 300 }}>
      <div>{book.title}</div>
      <div>{book.author}</div>
      <div>{book.category}</div>
      {isAuth && <><br /><div>{book.memo}</div></>}
    </Box>
  )
}
