import { makeStyles } from '@mui/styles'
const useStyles = makeStyles({
  title: {
    position: 'relative',
    display: 'inline-block',
    padding: '0 55px',
    '&::before,&::after': {
      content: "''",
      position: 'absolute',
      top: '50%',
      display: 'inline-block',
      width: '45px',
      height: '1px',
      backgroundColor: 'black',
    },
    '&::before': {
      left: 0,
    },
    '&::after': {
      right: 0,
    },
  },
})

interface Props {
  text: string
}
export const Title: React.FC<Props> = ({ text }) => {
  const classes = useStyles()
  return <h2 className={classes.title}>{text}</h2>
}
