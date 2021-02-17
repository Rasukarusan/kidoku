import { Container } from '@material-ui/core'

interface Props {
  children?: React.ReactNode
}

export const Layout = (props: Props) => {
  const { children } = props
  return <Container fixed>{children}</Container>
}
