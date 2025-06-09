import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material';
import theme from './theme.ts';
import { VocabProvider } from './contexts/VocabContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <VocabProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            'html, body, #root': {
              width: '100%',
              height: '100%',
              margin: 0,
              padding: 0,
            },
            '*': {
              boxSizing: 'border-box',
              scrollbarWidth: 'none', // Firefox
              '&::-webkit-scrollbar': {
                display: 'none', // Chrome, Safari
              },
            },
          }}
        />
        <App />
      </ThemeProvider>
    </VocabProvider>
  </React.StrictMode>
);