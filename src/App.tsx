import { Box } from '@mui/material';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <Box>
      <NavBar />
      <Box>
        <HomePage />
      </Box>
    </Box>
  );
}