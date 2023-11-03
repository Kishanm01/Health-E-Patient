import * as React from 'react';
import { createTheme, ThemeProvider } from "@mui/material"
//import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

//In case we want to edit the default theme
const theme = createTheme({
  palette: {
    background: {
      default: '#eaedf4',
    },
  },
});

export default function App({ Component, pageProps }) {  
  return (
    <ThemeProvider theme = {theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
