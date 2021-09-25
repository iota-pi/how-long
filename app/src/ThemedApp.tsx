import {
  CssBaseline,
  ThemeProvider,
  StyledEngineProvider,
} from '@mui/material';
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
