// theme.ts
import { createTheme } from '@mui/material/styles';
import type { PaletteColorOptions, PaletteColor } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    navy: PaletteColor;
    black: PaletteColor;
    brown: PaletteColor;
    beige: PaletteColor;
  }

  interface PaletteOptions {
    navy?: PaletteColorOptions;
    black?: PaletteColorOptions;
    brown?: PaletteColorOptions;
    beige?: PaletteColorOptions;
  }
}

const theme = createTheme({
  typography: {
    fontFamily: 'monospace',
  },
  palette: {
    mode: 'light',
    navy: {
      main: '#002145',
      light: '#334766',
      dark: '#00001f',
      contrastText: '#ffffff',
    },
    black: {
      main: '#000000',
      light: '#333333',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    brown: {
      main: '#715411',
      light: '#9a7733',
      dark: '#4e3a0b',
      contrastText: '#ffffff',
    },
    beige: {
      main: '#f3f2ed',
      light: '#faf9f5',
      dark: '#d6d4cb',
      contrastText: '#000000',
    },
    white: {
      main: '#ffffff',
      contrastText: '#000000'
    },
    yellow: {
      main: '#e0c145',
      contrastText: '#000000',
      light: '#f0d76c',
      dark: '#b89e2c',
    }

  },
});


declare module '@mui/material/styles' {
  interface Palette {
    navy: Palette['primary'];
    black: Palette['primary'];
    beige: Palette['primary'];
    brown: Palette['primary'];
    white: Palette['primary'];
    yellow: Palette['primary'];
  }

  interface PaletteOptions {
    navy?: PaletteOptions['primary'];
    black?: PaletteOptions['primary'];
    beige?: PaletteOptions['primary'];
    brown?: PaletteOptions['primary'];
    white?: PaletteOptions['primary'];
    yellow?: PaletteOptions['primary'];
  }
}

export default theme;