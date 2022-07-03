import { CircularProgress, Box } from '@material-ui/core'
export const Loading: React.FC = () => {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <CircularProgress />
    </Box>
  )
}
