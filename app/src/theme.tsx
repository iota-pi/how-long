import { red, teal, yellow } from '@material-ui/core/colors';
import { createTheme } from '@material-ui/core/styles';

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
