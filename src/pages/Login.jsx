import React, { useState } from 'react';
import { Container, Typography, Box, Button, TextField, Alert, Stack, IconButton, InputAdornment, Link as MuiLink, Divider, Skeleton, Paper, useTheme } from '@mui/material';
import { supabase } from '../supabaseClient';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Turnstile } from '@marsidev/react-turnstile';
import { validateTurnstileToken } from '../utils/turnstileValidation';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.21 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError('Παρακαλώ ολοκληρώστε την επαλήθευση.');
      enqueueSnackbar('Παρακαλώ ολοκληρώστε την επαλήθευση.', { variant: 'error' });
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    const validationResult = await validateTurnstileToken(turnstileToken);
    if (!validationResult.success) {
      setError('Η επαλήθευση απέτυχε. Παρακαλώ δοκιμάστε ξανά.');
      enqueueSnackbar('Η επαλήθευση απέτυχε.', { variant: 'error' });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (
        error.message.toLowerCase().includes('email not confirmed') ||
        error.message.toLowerCase().includes('email has not been confirmed') ||
        error.message.toLowerCase().includes('confirm your email')
      ) {
        setError('Το email σας δεν έχει επιβεβαιωθεί. Ελέγξτε το inbox σας.');
        enqueueSnackbar('Το email δεν έχει επιβεβαιωθεί.', { variant: 'warning' });
      } else {
        setError(error.message);
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    } else {
      setMessage('Επιτυχής είσοδος!');
      enqueueSnackbar('Επιτυχής είσοδος!', { variant: 'success' });
      navigate('/');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      localStorage.setItem('googleLoginSuccess', '1');
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } catch (err) {
      setError('Σφάλμα με Google login');
      enqueueSnackbar('Σφάλμα με Google login', { variant: 'error' });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: { xs: 2, md: 4 }, pb: { xs: 12, md: 4 }, px: 2 }}>
      <Paper
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, textAlign: 'center', color: 'text.primary' }}>
          Είσοδος
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>
          Συνδεθείτε στον λογαριασμό σας
        </Typography>

        {location.state?.registered && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Η εγγραφή ολοκληρώθηκε! Ελέγξτε το email σας.
          </Alert>
        )}

        {/* Google Button */}
        <Button
          variant="outlined"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={loading}
          sx={{
            mb: 2.5,
            py: 1.2,
            borderColor: isDark ? 'rgba(255,255,255,0.23)' : '#dadce0',
            color: isDark ? 'text.primary' : '#3c4043',
            fontWeight: 500,
            fontSize: '0.938rem',
            '&:hover': {
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa',
              borderColor: isDark ? 'rgba(255,255,255,0.4)' : '#dadce0',
            },
          }}
        >
          Συνέχεια με Google
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>ή</Typography>
        </Divider>

        {/* Form */}
        <Box component="form" onSubmit={handleSignIn}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              label="Κωδικός"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              value={password}
              onChange={e => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(s => !s)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              <Turnstile
                siteKey="0x4AAAAAABiQtKNjlTVw7zFL"
                onSuccess={(token) => { setTurnstileToken(token); setCanSubmit(true); }}
                onExpire={() => { setTurnstileToken(''); setCanSubmit(false); }}
                onError={() => { setTurnstileToken(''); setCanSubmit(false); }}
                theme={isDark ? 'dark' : 'light'}
                size="normal"
              />
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}

            <Button
              variant="contained"
              fullWidth
              type="submit"
              disabled={loading || !canSubmit}
              sx={{ py: 1.3, fontSize: '0.938rem' }}
            >
              Είσοδος
            </Button>

            <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 1 }}>
              Δεν έχεις λογαριασμό;{' '}
              <MuiLink component={Link} to="/register" underline="none" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Εγγραφή
              </MuiLink>
            </Typography>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;