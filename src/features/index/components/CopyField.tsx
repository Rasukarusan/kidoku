import { useState, useRef, useEffect } from 'react'
import { TextField, Snackbar } from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'
import { makeStyles } from '@material-ui/core/styles'
import { CopyList } from '../types'
import { getCopyText } from '../util'

const useStyles = makeStyles({
  root: {
    '& label': {
      fontFamily: 'Stick-Regular',
    },
  },
})

interface Props {
  titles: string[]
  copyList: CopyList
}
export const CopyField: React.FC<Props> = ({ titles, copyList }) => {
  const classes = useStyles()
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
      >
        <MuiAlert
          onClose={() => setOpen(false)}
          severity="success"
          elevation={6}
          variant="filled"
        >
          Copied!
        </MuiAlert>
      </Snackbar>
      <TextField
        className={classes.root}
        placeholder="クリックしてコピー"
        inputRef={ref}
        fullWidth
        defaultValue={text}
        multiline
        minRows={10}
        disabled
        variant="outlined"
        onClick={handleOnClick}
      />
    </>
  )
}
