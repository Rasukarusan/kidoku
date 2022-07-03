import { useState, useRef } from 'react'
import { TextField, Snackbar } from '@material-ui/core'
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert'
import { makeStyles } from '@material-ui/core/styles'
import { SelectList } from '../types'

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const useStyles = makeStyles({
  root: {
    '& label': {
      fontFamily: 'Stick-Regular',
    },
  },
})

interface Props {
  titles: string[]
  selectList: SelectList
}
export const CopyField: React.FC<Props> = ({ titles, selectList }) => {
  const classes = useStyles()
  const field = useRef<HTMLTextAreaElement>(null)
  const getList = () => {
    let list = ''
    titles.forEach((title: string) => {
      const formalTitle = title in selectList ? selectList[title].title : '-'
      const authors = title in selectList ? selectList[title].authors : '-'
      const categories =
        title in selectList ? selectList[title].categories : '-'
      list += formalTitle + '\t' + authors + '\t' + categories + '\n'
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
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
      >
        <Alert onClose={() => setOpen(false)} severity="success">
          Copied!
        </Alert>
      </Snackbar>
      <TextField
        className={classes.root}
        label="クリックしてコピー"
        inputRef={field}
        style={{
          display:
            Object.keys(selectList).length === 0 ? 'none' : 'inline-flex',
        }}
        fullWidth
        defaultValue={fieldValue}
        multiline
        minRows={Object.keys(selectList).length === 0 ? 1 : 10}
        disabled
        variant="outlined"
        onClick={handleOnClick}
      />
    </>
  )
}
