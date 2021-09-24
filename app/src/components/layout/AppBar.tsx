import {
  AppBar as MuiAppBar,
  styled,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { APP_NAME } from '../../utils';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(2),

  [theme.breakpoints.down('sm')]: {
    paddingRight: theme.spacing(1),
  },
}));

function AppBar() {
  return (
    <MuiAppBar
      enableColorOnDark
      position="fixed"
    >
      <StyledToolbar>
        <Typography variant="h6" color="inherit">
          {APP_NAME}
        </Typography>
      </StyledToolbar>
    </MuiAppBar>
  );
}

export default AppBar;
