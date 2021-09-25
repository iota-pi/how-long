import {
  Box,
  Container,
  MenuItem,
  Stack,
  styled,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import TimerIcon from '@mui/icons-material/Timer';
import axios from 'axios';
import { ChangeEvent, useCallback, useMemo, useState } from 'react';
import { API_BASE_URI } from './utils';

const Root = styled(Container)({
  height: '100vh',
});

const speedPresets = [
  { speed: '115–125', name: 'Slow' },
  { speed: '125–135', name: 'Normal' },
  { speed: '130–150', name: 'Fast' },
  { speed: 'custom', name: 'Custom' },
];

function secondsToMinutes(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState('');
  const [speedPreset, setSpeedPreset] = useState(speedPresets[1].speed);
  const [speedCustom, setSpeedCustom] = useState(speedPreset);
  const [words, setWords] = useState<number>();

  const handleChangeReference = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setReference(event.target.value),
    [],
  );
  const handleClickCheck = useCallback(
    async () => {
      const referenceURI = encodeURIComponent(reference);
      setLoading(true);
      try {
        const result = await axios.get(`${API_BASE_URI}/passage/${referenceURI}`);
        if (result.data.success) {
          setWords(result.data.words);
        }
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

  const customSpeedError = useMemo(
    () => {
      if (!/^\d+(–\d+)?$/.test(speedCustom)) {
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
        const wordsPerSecond = speed.split(/[–-]/g).map(x => parseInt(x) / 60);
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
          label="Reference"
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
          loading={loading}
          onClick={handleClickCheck}
          size="large"
          startIcon={<TimerIcon />}
          variant="contained"
        >
          Check
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
              variant="h2"
            >
              {lowSeconds === highSeconds ? (
                secondsToMinutes(lowSeconds)
              ) : (
                `${secondsToMinutes(lowSeconds)}–${secondsToMinutes(highSeconds)}`
              )}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={300}
              textAlign="center"
            >
              (~{words} word{words === 1 ? '' : 's'})
            </Typography>
          </Box>
        )}
      </Stack>
    </Root>
  );
}
