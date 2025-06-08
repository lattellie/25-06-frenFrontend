// src/components/NavBar.tsx
import { AppBar, Toolbar, Typography } from '@mui/material';
import theme from '../theme';

export default function NavBar() {
  return (
    <AppBar position="static" elevation={0} sx={{
      height: '8vh',
      justifyContent:'center',
      backgroundColor:theme.palette.white.main,
      color:theme.palette.white.contrastText,
      borderColor: theme.palette.black.main,
      borderBottom: `3px solid ${theme.palette.black.main}`,
    }}>
      <Toolbar>
        <Typography variant="h6" color="inherit" fontFamily={'monospace'}>
          French Vocab
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
