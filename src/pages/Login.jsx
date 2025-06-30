import React, { useState } from 'react';
import { Container, Typography, Box, Button, TextField, Alert, Stack, IconButton, InputAdornment, Link as MuiLink, Divider, Skeleton } from '@mui/material';
import { supabase } from '../supabaseClient';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Turnstile } from '@marsidev/react-turnstile';
import { validateTurnstileToken } from '../utils/turnstileValidation';
import WebAuthnLogin from '../components/WebAuthnLogin';

// Επίσημο Google G logo
const GoogleLogo = (
  <svg width="22" height="22" viewBox="0 0 48 48" style={{ marginRight: 8 }}>
    <g>
      <path d="M44.5 20H24v8.5h11.7C34.9 33.9 30.2 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.5 29.6 2 24 2 12.9 2 4 10.9 4 22s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z" fill="#FFC107"/>
      <path d="M6.3 14.7l7 5.1C15.1 16.2 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.5 29.6 2 24 2 15.3 2 7.7 7.6 6.3 14.7z" fill="#FF3D00"/>
      <path d="M24 44c5.2 0 10-1.8 13.7-4.9l-6.3-5.2C29.7 35.5 27 36.5 24 36.5c-6.1 0-11.3-4.1-13.1-9.6l-7 5.4C7.7 40.4 15.3 44 24 44z" fill="#4CAF50"/>
      <path d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C15.3 40.4 19.4 44 24 44c7.2 0 13-5.8 13-13 0-1.3-.1-2.7-.3-4z" fill="#1976D2"/>
    </g>
  </svg>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    
    // Server-side validation of Turnstile token
    const validationResult = await validateTurnstileToken(turnstileToken);
    if (!validationResult.success) {
      setError('Η επαλήθευση απέτυχε. Παρακαλώ δοκιμάστε ξανά.');
      enqueueSnackbar('Η επαλήθευση απέτυχε. Παρακαλώ δοκιμάστε ξανά.', { variant: 'error' });
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
        setError('Το email σας δεν έχει επιβεβαιωθεί. Ελέγξτε το inbox σας για το email επιβεβαίωσης.');
        enqueueSnackbar('Το email σας δεν έχει επιβεβαιωθεί. Ελέγξτε το inbox σας για το email επιβεβαίωσης.', { variant: 'warning' });
      } else {
        setError(error.message);
        enqueueSnackbar(error.message, { variant: 'error' });
      }
    }
    else {
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

  if (loading) return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" color="#212121" gutterBottom align={isMobile ? 'center' : 'left'}>
          ΕΙΣΟΔΟΣ
        </Typography>
        <Skeleton variant="rectangular" height={40} width="100%" sx={{ borderRadius: 2, mb: 2 }} />
        <Divider sx={{ my: 2, width: '100%' }}><Typography sx={{ color: '#888', fontWeight: 500 }}>Ή</Typography></Divider>
        <Box sx={{ mt: 0, width: '100%' }}>
          <Stack spacing={2} direction="column">
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
          </Stack>
        </Box>
      </Box>
    </Container>
  );

  return (
    <Container maxWidth="xs" sx={{ mt: 8, mb: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h5" color="#212121" gutterBottom align={isMobile ? 'center' : 'left'}>
          ΕΙΣΟΔΟΣ
        </Typography>
        {location.state?.registered && (
          <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
            Η εγγραφή ολοκληρώθηκε! Ελέγξτε το email σας για να ενεργοποιήσετε τον λογαριασμό σας.
          </Alert>
        )}
        <Button
          variant="outlined"
          fullWidth
          startIcon={
            <svg width="18" height="18" viewBox="0 0 18 18" style={{ marginRight: 8 }}>
              <g>
                <path d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8363H9v3.4818h4.8445c-.2082 1.1236-.8345 2.0763-1.7763 2.719v2.2582h2.8736c1.6845-1.5527 2.6582-3.8418 2.6582-6.6227z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.4673-.8064 5.9564-2.1864l-2.8736-2.2582c-.7973.5345-1.8136.8491-3.0827.8491-2.3718 0-4.3818-1.6018-5.0982-3.7573H.9391v2.2936C2.4227 16.9782 5.4818 18 9 18z" fill="#34A853"/>
                <path d="M3.9018 10.6473c-.1818-.5345-.2864-1.1045-.2864-1.6473s.1045-1.1127.2864-1.6473V5.0591H.9391C.3409 6.2373 0 7.5745 0 9c0 1.4255.3409 2.7627.9391 3.9409l2.9627-2.2936z" fill="#FBBC05"/>
                <path d="M9 3.5791c1.3218 0 2.5027.4545 3.4336 1.3455l2.5755-2.5755C13.4645.8064 11.4273 0 9 0 5.4818 0 2.4227 1.0218.9391 3.0591l2.9627 2.2936C4.6182 4.4282 6.6282 3.5791 9 3.5791z" fill="#EA4335"/>
              </g>
            </svg>
          }
          onClick={handleGoogleLogin}
          disabled={loading}
          sx={{
            backgroundColor: '#fff',
            color: '#3c4043',
            borderColor: '#dadce0',
            fontWeight: 500,
            borderRadius: 2,
            minHeight: 40,
            textTransform: 'none',
            fontFamily: 'Roboto, Arial, sans-serif',
            fontSize: '1rem',
            boxShadow: '0 1px 2px rgba(60,64,67,.08)',
            mb: 2,
            '&:hover': {
              backgroundColor: '#f7f8fa',
              borderColor: '#dadce0',
              boxShadow: '0 1px 3px rgba(60,64,67,.15)',
            },
            '&:focus': {
              outline: 'none',
              boxShadow: 'none',
              borderColor: '#dadce0',
            },
            '&:focus-visible': {
              outline: 'none',
              boxShadow: 'none',
              borderColor: '#dadce0',
            },
          }}
        >
          ΣΥΝΔΕΣΗ ΜΕ GOOGLE
        </Button>
        <Divider sx={{ my: 2, width: '100%' }}><Typography sx={{ color: '#888', fontWeight: 500 }}>Ή</Typography></Divider>
        <Box component="form" sx={{ mt: 0, width: '100%' }} onSubmit={handleSignIn}>
          <Stack spacing={2} direction="column">
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={e => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#212121',
                    borderWidth: '1px',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#212121',
                    borderWidth: '1px',
                    boxShadow: 'none',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'transparent',
                  },
                  '&.MuiInputBase-input': {
                    backgroundColor: 'transparent',
                  },
                },
              }}
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
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      sx={{
                        '&:focus': {
                          outline: 'none',
                          boxShadow: 'none',
                        },
                        '&:focus-visible': {
                          outline: 'none',
                          boxShadow: 'none',
                        },
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#212121',
                    borderWidth: '1px',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#212121',
                    borderWidth: '1px',
                    boxShadow: 'none',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'transparent',
                  },
                  '&.MuiInputBase-input': {
                    backgroundColor: 'transparent',
                  },
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <Turnstile
                siteKey="0x4AAAAAABiQtKNjlTVw7zFL"
                onSuccess={(token) => {
                  setTurnstileToken(token);
                  setCanSubmit(true);
                }}
                onExpire={() => {
                  setTurnstileToken('');
                  setCanSubmit(false);
                }}
                onError={() => {
                  setTurnstileToken('');
                  setCanSubmit(false);
                }}
                theme="light"
                size="normal"
              />
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            {message && <Alert severity="success">{message}</Alert>}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ fontSize: isMobile ? '1.1rem' : '1rem', py: isMobile ? 2 : 1 }}
              onClick={handleSignIn}
              type="submit"
              disabled={loading || !canSubmit}
            >
              ΕΙΣΟΔΟΣ
            </Button>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography component="span" sx={{ fontWeight: 500, fontSize: '1.05rem', letterSpacing: 0.5, textTransform: 'none', color: '#888', fontFamily: 'Roboto, Arial, sans-serif' }}>
                Δεν έχεις λογαριασμό;
              </Typography>{' '}
              <MuiLink component={Link} to="/register" underline="none" sx={{
                fontWeight: 700,
                color: '#212121',
                fontSize: '1.05rem',
                letterSpacing: 0.5,
                transition: 'color 0.2s',
                '&:hover': {
                  color: '#212121',
                  textDecoration: 'none',
                  textShadow: 'none',
                },
              }}>
                ΕΓΓΡΑΦΗ
              </MuiLink>
            </Box>
            {/* WebAuthn Login (Fingerprint/FaceID) */}
            <WebAuthnLogin onLogin={() => {
              enqueueSnackbar('Επιτυχής είσοδος!', { variant: 'success' });
              navigate('/');
            }} />
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 