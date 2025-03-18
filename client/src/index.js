import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Custom futuristic theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B5CF6', // Vibrant purple
      light: '#A78BFA',
      dark: '#7C3AED',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#10B981', // Emerald green
      light: '#34D399',
      dark: '#059669',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#050816', // Deep space blue
      paper: '#0F172A',  // Deeper blue for card backgrounds
    },
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
    },
    error: {
      main: '#EF4444',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3B82F6',
    },
    success: {
      main: '#10B981',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2.25rem',
      lineHeight: 1.2,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.2,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.2,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.2,
      letterSpacing: '0.0075em',
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#6b6b6b transparent',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: 'transparent',
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#6b6b6b',
            minHeight: 24,
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus': {
            backgroundColor: '#959595',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(139, 92, 246, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
          background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.7) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&:hover': {
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3), 0 6px 6px rgba(0, 0, 0, 0.2)',
            borderColor: 'rgba(139, 92, 246, 0.3)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(148, 163, 184, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(139, 92, 246, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#8B5CF6',
            },
          },
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
); 