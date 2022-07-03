import { makeStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'

const useStyles = makeStyles({
  title: {
    margin: 10,
    fontFamily: 'Stick-Regular',
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
