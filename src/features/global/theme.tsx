import { createTheme } from '@mui/material/styles'

// @see https://mui.com/material-ui/customization/color/
export const theme = createTheme({
  palette: {
    primary: {
      light: '#4f5b62',
      main: '#263238',
      dark: '#000a12',
      contrastText: '#fff',
    },
    secondary: {
      light: '#8eacbb',
      main: '#607d8b',
      dark: '#34515e',
      contrastText: '#000',
    },
  },
})
