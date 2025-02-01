import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Game from './pages/Game';
import Guide from './pages/Guide';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1E293B',
      light: '#334155',
      dark: '#0F172A',
    },
    secondary: {
      main: '#1E293B',
      light: '#334155',
      dark: '#0F172A',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    }
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.01em',
      textTransform: 'none',
    }
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(30, 41, 59, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          fontSize: '0.95rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: 'transparent',
          color: '#1E293B',
          border: '2px solid #1E293B',
          '&:hover': {
            backgroundColor: 'rgba(30, 41, 59, 0.05)',
            border: '2px solid #0F172A',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(30, 41, 59, 0.05)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(148, 163, 184, 0.12)',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 12
  },
});

const Footer = () => (
  <Box
    sx={{
      position: 'fixed',
      bottom: 5,
      right: 5,
      padding: '5px 10px',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      color: '#fff',
      borderRadius: '20px',
      fontSize: '12px',
      zIndex: 99999
    }}
  >
    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
      ModernSNAKE by{' '}
      <Link
        href="https://github.com/glownydev"
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          color: '#9333ea',
          textDecoration: 'none !important',
          '&:hover': {
            opacity: 0.4,
            textDecoration: 'none !important'
          },
          '&:visited': {
            textDecoration: 'none !important',
            color: '#9333ea'
          },
          '&:link': {
            textDecoration: 'none !important',
            color: '#9333ea'
          }
        }}
      >
        glownydev
      </Link>
    </Typography>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box 
          sx={{ 
            minHeight: '100vh',
            position: 'relative',
            background: '#FFFFFF'
          }}
        >
          <Navbar />
          <Box 
            sx={{ 
              pt: { xs: 8, sm: 10 },
              minHeight: '100vh',
              paddingBottom: '80px'
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/play" element={<Game />} />
              <Route path="/guide" element={<Guide />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 