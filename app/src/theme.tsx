import { red, teal, yellow } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: teal[700],
    },
    secondary: {
      main: yellow[700],
    },
    error: {
      main: red[600],
    },
    background: {
      default: '#fafafa',
    },
  },
});

export default theme;
