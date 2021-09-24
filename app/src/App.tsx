import { Box, Button, Container, Stack, styled, TextField, Typography } from '@material-ui/core';
import TimerIcon from '@material-ui/icons/Timer';
import axios from 'axios';
import { ChangeEvent, useCallback, useState } from 'react';
import { API_BASE_URI } from './utils';

const Root = styled(Container)({
  height: '100vh',
});

export default function App() {
  const [reference, setReference] = useState('');
  const [words, setWords] = useState<number>();

  const handleChangeReference = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setReference(event.target.value),
    [],
  );
  const handleClickCheck = useCallback(
    async () => {
      const referenceURI = encodeURIComponent(reference);
      const result = await axios.get(`${API_BASE_URI}/passage/${referenceURI}`);
      if (result.data.success) {
        setWords(result.data.words);
      }
    },
    [reference],
  );

  const minutes = words ? Math.ceil(words / 130) : 0;

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
          label="Reference"
          onChange={handleChangeReference}
          value={reference}
        />

        <Button
          onClick={handleClickCheck}
          size="large"
          startIcon={<TimerIcon />}
          variant="contained"
        >
          Check
        </Button>

        {words && (
          <Box pt={4}>
            <Typography
              color="primary"
              fontWeight={300}
              textAlign="center"
              variant="h2"
            >
              {minutes} minute{minutes === 1 ? '' : 's'}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={300}
              textAlign="center"
            >
              ({words} word{words === 1 ? '' : 's'})
            </Typography>
          </Box>
        )}
      </Stack>
    </Root>
  );
}
