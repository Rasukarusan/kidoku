import { useState, useRef } from 'react'
import { TextField, Snackbar } from '@material-ui/core'
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert'

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

export const CopyField = ({ selectList }) => {
  const field = useRef<HTMLTextAreaElement>(null)
  const getList = () => {
    let list = ''
    Object.keys(selectList).forEach((key) => {
      list += key + '\t' + selectList[key].authors + '\n'
    })
    return list
  }
  const fieldValue = getList()

  const [open, setOpen] = useState(false)
  const handleOnClick = () => {
    navigator.clipboard.writeText(fieldValue)
    setOpen(true)
  }
  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={1000}
        onClose={() => setOpen(false)}
      >
        <Alert onClose={() => setOpen(false)} severity="success">
          Copied!
        </Alert>
      </Snackbar>
      <TextField
        inputRef={field}
        style={{ width: '50%' }}
        defaultValue={fieldValue}
        multiline
        rows={10}
        disabled
        variant="outlined"
        onClick={handleOnClick}
      />
    </>
  )
}
