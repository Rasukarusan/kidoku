import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { Container } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      background: theme.palette.background.paper,
      minHeight: '100vh',
      padding: '0 0.5rem',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
)

interface Props {
  children?: React.ReactNode
}
export const Layout = (props: Props) => {
  const { children } = props
  const classes = useStyles()

  return <Container fixed>{children}</Container>
}
