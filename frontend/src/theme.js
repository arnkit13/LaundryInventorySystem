import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b5394', // deep ocean laundry blue
      light: '#3d85c6',
      dark: '#073763',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00bcd4', // water teal cyan
      light: '#33c9dc',
      dark: '#00838f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f0f4f8', // light water blue-gray
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // charcoal
      secondary: '#64748b', // slate
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { letterSpacing: '0.01em' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 12, // Modern smooth rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(11, 83, 148, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)',
          borderRadius: 16,
          border: '1px solid rgba(226, 232, 240, 0.8)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#073763', // Admin dark sidebar theme
          color: '#ffffff',
          borderRight: 'none',
        },
      },
    },
  },
});

export default theme;
