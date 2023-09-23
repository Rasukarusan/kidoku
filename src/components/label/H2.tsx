import { makeStyles } from '@mui/styles'
import { Typography } from '@mui/material'

const useStyles = makeStyles({
  title: {
    margin: 10,
    fontFamily: 'Nico Moji',
  },
})

interface Props {
  title: string
}

export const H2: React.FC<Props> = ({ title }) => {
  const classes = useStyles()
  return (
    <Typography variant="h2" className={classes.title}>
      {title}
    </Typography>
  )
}
