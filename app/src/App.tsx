import { Toolbar } from '@material-ui/core';
import makeStyles from '@material-ui/styles/makeStyles';
import AppBar from './components/layout/AppBar';


const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    height: '100vh',
  },
  section: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paddingTop: {
    paddingTop: theme.spacing(2),
  },
  content: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  },
}));


export default function App() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar />

      <div className={classes.content}>
        <Toolbar />

        Hello
      </div>
    </div>
  );
}
