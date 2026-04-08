import React, { useState } from 'react';
import {
  Typography, Box, Button, TextField, Alert, Stack,
  IconButton, InputAdornment, Link as MuiLink, Divider, Paper, useTheme, Chip
} from '@mui/material';
import { supabase } from '../supabaseClient';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Turnstile } from '@marsidev/react-turnstile';
import { validateTurnstileToken } from '../utils/turnstileValidation';
import SchoolIcon from '@mui/icons-material/School';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.21 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
  </svg>
);

const FeatureBullet = ({ text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
    <Box sx={{
      width: 6, height: 6, borderRadius: '50%',
      background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.6))',
      flexShrink: 0,
    }} />
    <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: '0.875rem', lineHeight: 1.5 }}>
      {text}
    </Typography>
  </Box>
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
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.default',
      }}
    >
      {/* Left Panel – Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 420px',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 6,
          py: 8,
          background: 'linear-gradient(145deg, #1a73e8 0%, #0052cc 55%, #1565c0 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 260, height: 260, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position: 'absolute', bottom: -100, left: -60, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <SchoolIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
              DSUth Exam Bank
            </Typography>
          </Box>

          <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '2rem', lineHeight: 1.15, letterSpacing: '-0.03em', mb: 1.5 }}>
            Καλώς ήρθες<br />ξανά! 👋
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', mb: 4, lineHeight: 1.65 }}>
            Η κοινοτική πλατφόρμα θεμάτων εξετάσεων για φοιτητές Ψηφιακών Συστημάτων UTH.
          </Typography>

          <FeatureBullet text="150+ θέματα εξετάσεων διαθέσιμα" />
          <FeatureBullet text="Οργανωμένα ανά μάθημα και εξάμηνο" />
          <FeatureBullet text="Ανέβασε και μοιράσου δικά σου αρχεία" />
          <FeatureBullet text="Αποθήκευσε αγαπημένα μαθήματα" />
        </Box>
      </Box>

      {/* Right Panel – Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2.5, md: 6 },
          py: { xs: 4, md: 6 },
          pb: { xs: 6, md: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
          {/* Mobile brand */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #1a73e8, #0052cc)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '0.8rem' }}>DS</Typography>
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: 'text.primary', letterSpacing: '-0.02em' }}>
              DSUth Exam Bank
            </Typography>
          </Box>

          <Box sx={{ mb: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Box sx={{
              width: 44, height: 44, borderRadius: '14px',
              bgcolor: isDark ? 'rgba(26,115,232,0.15)' : 'rgba(26,115,232,0.09)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mb: 2,
              mx: { xs: 'auto', md: 0 },
            }}>
              <LockOutlinedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 0.5 }}>
              Είσοδος
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Συνδεθείτε στον λογαριασμό σας
            </Typography>
          </Box>

          {location.state?.registered && (
            <Alert severity="success" sx={{ my: 2.5, borderRadius: '12px' }}>
              Η εγγραφή ολοκληρώθηκε! Ελέγξτε το email σας.
            </Alert>
          )}

          {/* Google */}
          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{
              mt: 2.5,
              mb: 2.5,
              py: 1.3,
              borderRadius: '12px',
              borderColor: isDark ? 'rgba(255,255,255,0.15)' : '#dadce0',
              color: isDark ? 'text.primary' : '#3c4043',
              fontWeight: 600,
              fontSize: '0.9rem',
              '&:hover': {
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#f8f9fa',
                borderColor: isDark ? 'rgba(255,255,255,0.3)' : '#c5c7c9',
              },
            }}
          >
            Συνέχεια με Google
          </Button>

          <Divider sx={{ mb: 2.5 }}>
            <Typography variant="body2" sx={{ color: 'text.disabled', px: 1, fontSize: '0.8rem' }}>ή με email</Typography>
          </Divider>

          <Box component="form" onSubmit={handleSignIn}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={e => setEmail(e.target.value)}
                size="medium"
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
                      <IconButton onClick={() => setShowPassword(s => !s)} edge="end" size="small">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
                <Turnstile
                  siteKey="0x4AAAAAABiQtKNjlTVw7zFL"
                  onSuccess={(token) => { setTurnstileToken(token); setCanSubmit(true); }}
                  onExpire={() => { setTurnstileToken(''); setCanSubmit(false); }}
                  onError={() => { setTurnstileToken(''); setCanSubmit(false); }}
                  theme={isDark ? 'dark' : 'light'}
                  size="normal"
                />
              </Box>

              {error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}
              {message && <Alert severity="success" sx={{ borderRadius: '12px' }}>{message}</Alert>}

              <Button
                variant="contained"
                fullWidth
                type="submit"
                disabled={loading || !canSubmit}
                sx={{
                  py: 1.4,
                  fontSize: '0.938rem',
                  fontWeight: 700,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1a73e8, #0052cc)',
                  '&:hover': { background: 'linear-gradient(135deg, #1557b0, #003ea8)' },
                  '&:disabled': { opacity: 0.55 },
                }}
              >
                {loading ? 'Σύνδεση...' : 'Είσοδος'}
              </Button>

              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 0.5, fontSize: '0.875rem' }}>
                Δεν έχεις λογαριασμό;{' '}
                <MuiLink component={Link} to="/register" underline="none" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Εγγραφή
                </MuiLink>
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;