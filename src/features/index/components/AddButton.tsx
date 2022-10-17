import { Box, Button, CircularProgress } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useRecoilValue } from 'recoil'
import { selectItemsBodySelector } from '@/store/selectItems/selector'
import { useEffect, useState } from 'react'
import { green } from '@mui/material/colors'
import CheckIcon from '@mui/icons-material/Check'
import { theme } from '@/features/global'

export const AddButton: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const body = useRecoilValue(selectItemsBodySelector)

  useEffect(() => {
    setSuccess(false)
    setLoading(false)
  }, [body])

  const onClick = () => {
    setSuccess(false)
    setLoading(true)
    const res = fetch('/api/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((res) => {
      setSuccess(true)
      setLoading(false)
    })
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'right',
        paddingTop: '8px',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Button
          color="primary"
          variant="contained"
          sx={{
            background: success ? green[500] : theme.palette.primary.main,
            '&:hover': { background: success ? green[500] : '' },
          }}
          disabled={loading}
          onClick={onClick}
          endIcon={success ? <CheckIcon /> : <AddIcon />}
        >
          {success ? '完了' : 'シートに追加'}
        </Button>
        {loading && (
          <CircularProgress
            size={24}
            sx={{
              color: green[500],
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
    </div>
  )
}
