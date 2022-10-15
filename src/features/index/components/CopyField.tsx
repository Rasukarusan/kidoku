import { useRecoilState } from 'recoil'
import { useState, useRef, useEffect } from 'react'
import { TextField, Snackbar, Alert } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { copyListAtom } from '@/store/copyList'
import { getCopyText } from '../util'

const useStyles = makeStyles({
  root: {
    '& label': {
      fontFamily: 'Nico Moji',
    },
  },
})

interface Props {
  titles: string[]
}
export const CopyField: React.FC<Props> = ({ titles }) => {
  const classes = useStyles()
  const [copyList, setCopyList] = useRecoilState(copyListAtom)
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const text = getCopyText(titles, copyList)
    setText(text)
  }, [titles, copyList])

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
