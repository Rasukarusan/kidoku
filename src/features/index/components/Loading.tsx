import { CircularProgress, Box } from '@mui/material'
export const Loading: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <CircularProgress />
    </Box>
  )
}
