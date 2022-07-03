import { useRef, useState, startTransition } from 'react'
import Autocomplete from '@material-ui/lab/Autocomplete'

interface Props {
  id: string
  value: string
  open: boolean
}

export const Suggestion: React.FC<Props> = ({ id, value, open }) => {
  return (
    <Autocomplete
      id={id}
      freeSolo={true}
      open={open}
      value={value}
      onChange={(event, newValue) => {
        const values = value
          .split('\n')
          .filter((v) => v !== '')
          .slice(0, -1)
        setValue([...values, newValue].join('\n'))
        setOptions([])
        setOpenSuggest(false)
      }}
      options={options}
      filterOptions={(options) => options}
      closeIcon={<></>}
      renderInput={(params) => (
        <TextField
          {...params}
          className={classes.suggestTextField}
          inputRef={suggestRef}
          onChange={onSuggestChange}
          inputProps={{
            ...params.inputProps,
            className: classes.suggestInput,
          }}
        />
      )}
    />
  )
}
