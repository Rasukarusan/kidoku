import { makeStyles } from '@material-ui/core/styles'
import { OpenInNew } from '@material-ui/icons'
import { Box, Typography, Link } from '@material-ui/core'

const useStyles = makeStyles({
  link: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
})
export const SheetLink: React.FC = () => {
  const classes = useStyles()
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Link
        target="_blank"
        rel="noreferrer"
        href="https://docs.google.com/spreadsheets/d/1AgAMtzU1xFYfV5OueYkA6MDSNIgjVOHG39CRdKYcVFA/edit#gid=789903411"
      >
        <Typography
          color="primary"
          variant="subtitle1"
          className={classes.link}
        >
          シート
          <OpenInNew style={{ paddingLeft: 5 }} />
        </Typography>
      </Link>
    </Box>
  )
}
