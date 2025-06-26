import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Box from '@mui/material/Box';
import Home from './pages/Home';
import Login from './pages/Login';
import Upload from './pages/Upload';
import AdminPanel from './pages/AdminPanel';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NavBar from './components/NavBar';
import React, { lazy, Suspense, useEffect } from 'react';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCourses from './pages/admin/AdminCourses';
import Courses from './pages/Courses';
import CourseFiles from './pages/CourseFiles';
import Footer from './components/Footer';
import Favorites from './pages/Favorites';
import { SnackbarProvider } from 'notistack';
import AdminUpload from './pages/admin/AdminUpload';
import RequireAdmin from './components/RequireAdmin';

const theme = createTheme({
  palette: {
    primary: {
      main: '#333', // Πιο απαλό μαύρο
    },
    secondary: {
      main: '#FFD200', // Χρυσό
    },
    background: {
      default: '#f8fafc', // Πολύ ανοιχτό γκρι/λευκό
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

const AdminFiles = lazy(() => import('./pages/admin/AdminFiles'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

function App() {
  // Καθαρισμός του # από το URL μετά το Google OAuth login
  useEffect(() => {
    if (window.location.hash === '#') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} autoHideDuration={2500}>
        <CssBaseline />
        <Box sx={{ overflowX: 'hidden', maxWidth: '100vw', pt: { xs: '56px', md: '64px' } }}>
          <NavBar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/admin" element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }>
              <Route path="files" element={<Suspense fallback={<div>Loading...</div>}><AdminFiles /></Suspense>} />
              <Route path="users" element={<Suspense fallback={<div>Loading...</div>}><AdminUsers /></Suspense>} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="upload" element={<AdminUpload />} />
            </Route>
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseFiles />} />
          </Routes>
        </Box>
        <Footer />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
