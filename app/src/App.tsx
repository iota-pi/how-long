import { Button, Container, Stack, styled, TextField, Toolbar } from '@material-ui/core';
import axios from 'axios';
import { ChangeEvent, useCallback, useState } from 'react';
import AppBar from './components/layout/AppBar';
import { API_BASE_URI } from './utils';

const Root = styled(Container)({
  height: '100vh',
});

export default function App() {
  const [reference, setReference] = useState('');

  const handleChangeReference = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setReference(event.target.value),
    [],
  );
  const handleClickCheck = useCallback(
    async () => {
      const referenceURI = encodeURIComponent(reference);
      const result = await axios.get(`${API_BASE_URI}/passage/${referenceURI}`);
      console.warn(result.data);
    },
    [reference],
  );

  return (
    <Root maxWidth="md">
      <AppBar />
      <Toolbar />

      <Stack p={2} spacing={2}>
        <TextField
          label="Reference"
          onChange={handleChangeReference}
          value={reference}
        />

        <Button
          onClick={handleClickCheck}
        >
          Check
        </Button>
      </Stack>
    </Root>
  );
}
