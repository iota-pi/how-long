import {
  CssBaseline,
  Theme,
  ThemeProvider,
  StyledEngineProvider,
} from '@material-ui/core';
import App from './App';
import theme from './theme';

declare module '@material-ui/styles/defaultTheme' {
  interface DefaultTheme extends Theme {}
}

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
