import {
  CssBaseline,
  ThemeProvider,
  StyledEngineProvider,
} from '@material-ui/core';
import App from './App';
import theme from './theme';

export default function ThemedApp() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
