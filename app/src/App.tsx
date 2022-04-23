import {
  Alert,
  Box,
  Container,
  MenuItem,
  Snackbar,
  Stack,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import TimerIcon from '@mui/icons-material/Timer';
import axios from 'axios';
import { ChangeEvent, KeyboardEvent, useCallback, useMemo, useState } from 'react';
import { API_BASE_URI, ParsedReference, prettyPassage } from './utils';

const Root = styled(Container)({
  height: '100vh',
});

const speedPresets = [
  { speed: '150–170', name: 'Slow' },
  { speed: '170–185', name: 'Normal' },
  { speed: '185–200', name: 'Fast' },
  { speed: '170–200', name: 'Internal Slow' },
  { speed: '250', name: 'Internal Normal' },
  { speed: '300–400', name: 'Internal Fast' },
  { speed: 'custom', name: 'Custom' },
];

function secondsToDisplayTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = (seconds - minutes * 60).toString().padStart(2, '0');
  const hours = Math.floor(minutes / 60);
  const remainderMinutes = (minutes - hours * 60).toString().padStart(2, '0');
  return [
    hours,
    remainderMinutes,
    remainderSeconds,
  ].filter(x => x !== 0).join(':');
}

export default function App() {
  const [requestError, setRequestError] = useState({ message: '', show: false });
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState('');
  const [speedPreset, setSpeedPreset] = useState(speedPresets[1].speed);
  const [speedCustom, setSpeedCustom] = useState(speedPreset);
  const [words, setWords] = useState<number>();
  const [parsedPassage, setParsedPassage] = useState<ParsedReference>({
    book: '',
    startChapter: 0,
    startVerse: 0,
    endChapter: 0,
    endVerse: 0,
  });

  const handleChangeReference = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setReference(event.target.value),
    [],
  );
  const handleClickEstimate = useCallback(
    async () => {
      const referenceURI = encodeURIComponent(reference);
      setLoading(true);
      try {
        const result = await axios.get(`${API_BASE_URI}/passage/${referenceURI}`);
        if (result.data.success) {
          setWords(result.data.words);
          setParsedPassage(result.data.passage);
        }
      } catch (error) {
        setRequestError({
          message: 'Something went wrong. Please check the passage reference or try again later.',
          show: true,
        });
      } finally {
        setLoading(false);
      }
    },
    [reference],
  );
  const handleChangeSpeedPreset = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSpeedPreset(event.target.value),
    [],
  );
  const handleChangeSpeedCustom = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSpeedCustom(event.target.value);
    },
    [],
  );
  const handleCloseSnackbar = useCallback(
    () => setRequestError(error => ({ ...error, show: false })),
    [],
  );
  const handleExitedSnackbar = useCallback(
    () => setRequestError({ message: '', show: false }),
    [],
  );

  const validPassage = useMemo(
    () => {
      if (!reference) return true;

      const regex = new RegExp([
        '^',
        '([0-9]?[a-zA-Z ]*[a-zA-Z]\\.?) ?',
        '([0-9]+(?: ?\\: ?[0-9]+)?(?: ?- ?(?:[0-9]+(?: ?\\: ?[0-9]+)?))?)?',
        '$',
      ].join(''));
      return regex.test(reference);
    },
    [reference],
  );
  const customSpeedError = useMemo(
    () => {
      if (!/^\d+([-–]\d+)?$/.test(speedCustom)) {
        return true;
      }
      const [low, high = low] = speedCustom.split(/[–-]/g);
      if (parseInt(low) > parseInt(high)) {
        return true;
      }
      return false;
    },
    [speedCustom],
  );
  const [lowSeconds, highSeconds] = useMemo(
    () => {
      if (words) {
        const speed = speedPreset === 'custom' ? speedCustom : speedPreset;
        const wordsPerSecond = speed.split(/[-–]/g).map(x => parseInt(x) / 60);
        const [lowSpeed, highSpeed = lowSpeed] = wordsPerSecond;
        const low = Math.max(1, Math.floor(words / highSpeed));
        const high = Math.ceil(words / lowSpeed);
        if (high - low < 30) {
          const avg = Math.round((low + high) / 2 / 10) * 10;
          return [avg, avg];
        }
        return [low, high].map(x => Math.round(x / 10) * 10);
      }
      return [0, 0];
    },
    [speedCustom, speedPreset, words],
  );
  const passageText = useMemo(
    () => {
      if (!parsedPassage.book) {
        return '';
      }

      return prettyPassage(parsedPassage);
    },
    [parsedPassage],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        if (reference && validPassage) {
          handleClickEstimate();
        }
      }
    },
    [handleClickEstimate, reference, validPassage],
  );

  return (
    <Root maxWidth="md">
      <Box py={4}>
        <Typography
          variant="h1"
          textAlign="center"
          color="primary"
        >
          How Long
        </Typography>
        <Typography
          variant="h4"
          fontWeight={300}
          textAlign="center"
        >
          will it take to read this passage?
        </Typography>
      </Box>

      <Stack p={2} spacing={2}>
        <TextField
          autoFocus
          error={!validPassage}
          helperText={validPassage ? undefined : 'Please enter a valid passage reference'}
          label="Reference"
          onKeyPress={handleKeyPress}
          onChange={handleChangeReference}
          value={reference}
        />

        <Stack direction="row" spacing={2}>
          <TextField
            fullWidth
            label="Reading Speed"
            onChange={handleChangeSpeedPreset}
            select
            value={speedPreset}
          >
            {speedPresets.map(({ name, speed }) => (
              <MenuItem key={name} value={speed}>
                <Typography>
                  {name}
                  {speed !== 'custom' && (
                    <span>
                      {' '}
                      ({speed} wpm)
                    </span>
                  )}
                </Typography>
              </MenuItem>
            ))}
          </TextField>

          {speedPreset === 'custom' && (
            <TextField
              error={customSpeedError}
              helperText={customSpeedError ? 'Please enter a number or a numeric range' : ''}
              fullWidth
              label="Custom Reading Speed"
              onChange={handleChangeSpeedCustom}
              value={speedCustom}
            />
          )}
        </Stack>

        <LoadingButton
          disabled={!reference || !validPassage}
          loading={loading}
          onClick={handleClickEstimate}
          size="large"
          startIcon={<TimerIcon />}
          variant="contained"
        >
          Estimate
        </LoadingButton>

        {words && (
          <Box
            pt={4}
            sx={{
              opacity: loading ? 0.65 : undefined,
            }}
          >
            <Typography
              color="primary"
              fontWeight={300}
              textAlign="center"
              variant={lowSeconds === highSeconds ? 'h1' : 'h2'}
            >
              {lowSeconds === highSeconds ? (
                secondsToDisplayTime(lowSeconds)
              ) : (
                `${secondsToDisplayTime(lowSeconds)}–${secondsToDisplayTime(highSeconds)}`
              )}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={300}
              textAlign="center"
            >
              {passageText} (ESV)
            </Typography>

            <Typography
              variant="h5"
              fontWeight={300}
              textAlign="center"
            >
              (~{Math.round(words / 10) * 10} words)
            </Typography>
          </Box>
        )}
      </Stack>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        TransitionProps={{
          onExited: handleExitedSnackbar,
        }}
        open={requestError.show}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {requestError.message}
        </Alert>
      </Snackbar>
    </Root>
  );
}
