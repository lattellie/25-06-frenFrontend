// src/components/NavBar.tsx
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography } from '@mui/material';
import theme from '../theme';


export default function NavBar() {
  return (
    <AppBar position="static" elevation={0} sx={{
      height: '8vh',
      justifyContent: 'center',
      backgroundColor: theme.palette.white.main,
      color: theme.palette.white.contrastText,
      borderColor: theme.palette.black.main,
      borderBottom: `3px solid ${theme.palette.black.main}`,
    }}>
      <Toolbar>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography variant="h6" fontFamily="monospace" sx={{ cursor: 'pointer' }}>
            French Vocab
          </Typography>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
