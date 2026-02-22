import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Home from './pages/Home';
import Login from './pages/Login';
import Upload from './pages/Upload';
import AdminPanel from './pages/AdminPanel';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import AdminApplication from './pages/AdminApplication';
import NavBar from './components/NavBar';
import React, { lazy, Suspense, useEffect, useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import Courses from './pages/Courses';
import CourseFiles from './pages/CourseFiles';
import Footer from './components/Footer';
import Favorites from './pages/Favorites';
import FileViewer from './pages/FileViewer';
import { SnackbarProvider } from 'notistack';
import AdminUpload from './pages/admin/AdminUpload';
import RequireAdmin from './components/RequireAdmin';
import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Requests from './pages/Requests';
import BottomNav from './components/BottomNav';
import { useMediaQuery } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export const ColorModeContext = React.createContext({ toggleColorMode: () => { } });
export const AdminSidebarContext = React.createContext({ onToggle: null });

/* ── Material Design 3–inspired theme ── */
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: {
      main: '#1a73e8',
      light: '#e8f0fe',
      dark: '#1557b0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#5f6368',
      light: '#f1f3f4',
      dark: '#3c4043',
    },
    background: {
      default: mode === 'light' ? '#f8fafb' : '#202124',
      paper: mode === 'light' ? '#ffffff' : '#2d2e30',
    },
    text: {
      primary: mode === 'light' ? '#1f1f1f' : '#e8eaed',
      secondary: mode === 'light' ? '#5f6368' : '#9aa0a6',
    },
    divider: mode === 'light' ? '#e0e0e0' : '#3c4043',
    error: {
      main: '#d93025',
    },
    success: {
      main: '#1e8e3e',
    },
    warning: {
      main: '#f9ab00',
    },
    info: {
      main: '#1a73e8',
    },
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.01em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 100,
          padding: '10px 24px',
          fontSize: '0.938rem',
          textTransform: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#1557b0',
          },
        },
        outlined: {
          borderColor: mode === 'light' ? '#dadce0' : '#424242',
          color: mode === 'light' ? '#3c4043' : '#e0e0e0',
          '&:hover': {
            backgroundColor: mode === 'light' ? '#f1f3f4' : 'rgba(255, 255, 255, 0.08)',
            borderColor: mode === 'light' ? '#dadce0' : '#424242',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${mode === 'light' ? '#e0e0e0' : '#333'}`,
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: mode === 'light' ? '0 4px 20px rgba(0,0,0,0.08)' : '0 4px 20px rgba(0,0,0,0.4)',
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'medium',
      },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: mode === 'light' ? '#fff' : 'rgba(255,255,255,0.06)',
            '& fieldset': {
              borderColor: mode === 'light' ? '#dadce0' : '#555',
            },
            '&:hover fieldset': {
              borderColor: '#1a73e8',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1a73e8',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
    MuiAccordion: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: '12px !important',
          border: `1px solid ${mode === 'light' ? '#e0e0e0' : '#333'}`,
          '&:before': { display: 'none' },
          '&.Mui-expanded': {
            margin: 0,
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus': { outline: 'none' },
          '&:focus-visible': { outline: 'none' },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: '24px 0 0 24px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 100,
          height: 6,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const AdminFiles = lazy(() => import('./pages/admin/AdminFiles'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminRequests = lazy(() => import('./pages/admin/AdminRequests'));
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'));

function ScrollToTop() {
  const location = useLocation();
  React.useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, 0);
  }, [location.pathname]);
  return null;
}

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode ? savedMode : (prefersDarkMode ? 'dark' : 'light');
  });

  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
    }),
    [],
  );

  const activeTheme = React.useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  // Sync body class for dark-mode CSS (autofill fix, scrollbar, etc.)
  useEffect(() => {
    if (mode === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [mode]);

  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const backPressedRef = useRef(false);

  // Android back button/gesture handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = CapApp.addListener('backButton', ({ canGoBack }) => {
      // If we're on the home page
      if (location.pathname === '/') {
        if (backPressedRef.current) {
          // Second press within timeout → exit app
          CapApp.exitApp();
        } else {
          // First press → show warning, set flag
          backPressedRef.current = true;
          // We use a simple native-style toast via alert-like approach
          // Create a temporary toast element
          const toast = document.createElement('div');
          toast.textContent = 'Πάτα ξανά πίσω για έξοδο';
          Object.assign(toast.style, {
            position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '10px 24px',
            borderRadius: '24px', fontSize: '14px', fontWeight: '500',
            zIndex: '99999', transition: 'opacity 0.3s', opacity: '1',
            fontFamily: "'Inter', system-ui, sans-serif",
          });
          document.body.appendChild(toast);
          setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => document.body.removeChild(toast), 300);
          }, 1700);
          setTimeout(() => { backPressedRef.current = false; }, 2000);
        }
      } else {
        // Not on home — navigate back
        navigate(-1);
      }
    });

    return () => {
      listener.then(l => l.remove());
    };
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (window.location.hash === '#') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const isMobile = useMediaQuery(activeTheme.breakpoints.down('md'));

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={activeTheme}>
        <ScrollToTop />
        <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} autoHideDuration={2500}>
          <CssBaseline />
          <Box sx={{
            overflowX: 'hidden',
            maxWidth: '100vw',
            pt: { xs: 'calc(56px + env(safe-area-inset-top, 0px))', md: 'calc(64px + env(safe-area-inset-top, 0px))' },
          }}>

            <NavBar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }>
                <Route path="files" element={<Suspense fallback={<div>Loading...</div>}><AdminFiles /></Suspense>} />
                <Route path="users" element={<Suspense fallback={<div>Loading...</div>}><AdminUsers /></Suspense>} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="upload" element={<AdminUpload />} />
                <Route path="requests" element={<Suspense fallback={<div>Loading...</div>}><AdminRequests /></Suspense>} />
                <Route path="applications" element={<Suspense fallback={<div>Loading...</div>}><AdminApplications /></Suspense>} />
              </Route>
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin-application" element={<AdminApplication />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseFiles />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/viewer" element={<FileViewer />} />
            </Routes>
          </Box>
          {isMobile && !isAdminRoute && <BottomNav />}
          {!isMobile && !isAdminRoute && <Footer />}
        </SnackbarProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
