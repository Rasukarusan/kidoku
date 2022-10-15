import { useRecoilValue } from 'recoil'
import { useState, useRef, useEffect } from 'react'
import { TextField, Snackbar, Alert } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { selectItemsAtom } from '@/store/selectItems'
import { getCopyText } from '../util'

const useStyles = makeStyles({
  root: {
    '& label': {
      fontFamily: 'Nico Moji',
    },
  },
})

export const CopyField: React.FC = () => {
  const classes = useStyles()
  const selectItems = useRecoilValue(selectItemsAtom)
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const text = getCopyText(selectItems)
    setText(text)
  }, [selectItems])

  const handleOnClick = () => {
    navigator.clipboard.writeText(text)
    setOpen(true)
  }
  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity="success"
          elevation={6}
          variant="filled"
        >
          Copied!
        </Alert>
      </Snackbar>
      <TextField
        className={classes.root}
        placeholder="クリックしてコピー"
        inputRef={ref}
        fullWidth
        defaultValue={text}
        multiline
        rows={10}
        disabled
        variant="outlined"
        onClick={handleOnClick}
      />
    </>
  )
}
