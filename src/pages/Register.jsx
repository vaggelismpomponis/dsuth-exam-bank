import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MuiLink from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import { Eye, EyeOff, GraduationCap, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Turnstile } from '@marsidev/react-turnstile';
import { validateTurnstileToken } from '../utils/turnstileValidation';
import { validatePassword } from '../utils/passwordValidation';
import { getGreekAuthError } from '../utils/authErrors';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { AppLogo } from '../components/common/AppLogo';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.21 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
  </svg>
);

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError('Παρακαλώ ολοκληρώστε την επαλήθευση.');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError('Ο κωδικός δεν πληροί τις απαιτήσεις ασφαλείας.');
      return;
    }

    setLoading(true);
    setError('');

    const validationResult = await validateTurnstileToken(turnstileToken);
    if (!validationResult.success) {
      setError('Η επαλήθευση απέτυχε. Παρακαλώ δοκιμάστε ξανά.');
      setLoading(false);
      return;
    }

    const redirectTo = `${window.location.origin}/login`;
    const { error: signUpErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (signUpErr) {
      setError(getGreekAuthError(signUpErr.message));
    } else {
      navigate('/login', { state: { registered: true, email: email.trim() } });
      return;
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const redirectTo = `${window.location.origin}/`;
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      if (oauthErr) throw oauthErr;
    } catch (err) {
      setError(getGreekAuthError(err?.message) || 'Σφάλμα κατά τη σύνδεση με Google.');
      setLoading(false);
    }
  };

  return (
    <Box component="main" sx={{ minHeight: 'calc(100dvh - 64px)', display: 'flex', bgcolor: 'background.default' }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: '0 0 440px',
          flexDirection: 'column',
          justifyContent: 'center',
          px: 6,
          py: 8,
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ mb: 3 }}>
          <AppLogo size={46} showText={false} />
        </Box>
        <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'primary.main', mb: 1.5 }}>
          ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΙΑΣ
        </Typography>
        <Typography variant="h2" sx={{ fontWeight: 800, fontSize: '2rem', letterSpacing: '-0.03em', mb: 1.5, color: 'text.primary' }}>
          Δημιουργία Λογαριασμού
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 4 }}>
          Γίνετε μέλος της κοινότητας DSUth. Αποθηκεύστε αγαπημένα μαθήματα και συνεισφέρετε υλικό για τις εξετάσεις.
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <GraduationCap size={20} color="var(--mui-palette-primary-main, #1a73e8)" />
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>Δωρεάν πρόσβαση σε όλο το υλικό</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <UserPlus size={20} color="var(--mui-palette-primary-main, #1a73e8)" />
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>Συνεισφορά θεμάτων και σημειώσεων</Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2.5, md: 6 }, py: 6 }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 2 }}>
              <AppLogo size={36} showText={true} />
            </Box>
            <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'primary.main', mb: 1, display: 'block' }}>
              ΝΕΟΣ ΧΡΗΣΤΗΣ
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 0.5 }}>
              Εγγραφή
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Συμπληρώστε τα στοιχεία σας για να δημιουργήσετε λογαριασμό.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={loading}
            sx={{ minHeight: 44, mb: 2.5, borderRadius: '8px', fontWeight: 600 }}
          >
            Εγγραφή με Google
          </Button>

          <Divider sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', px: 1 }}>ή με email</Typography>
          </Divider>

          <Box component="form" onSubmit={handleSignUp}>
            <Stack spacing={2}>
              <TextField label="Email" type="email" inputMode="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField
                label="Κωδικός πρόσβασης"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="Εμφάνιση κωδικού" onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {password && <PasswordStrengthIndicator password={password} />}

              <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
                <Turnstile
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAABiQtKNjlTVw7zFL'}
                  options={{ retry: 'auto', retryInterval: 1500 }}
                  onSuccess={(token) => { setTurnstileToken(token); setCanSubmit(true); setError(''); }}
                  onExpire={() => { setTurnstileToken(''); setCanSubmit(false); }}
                  onError={() => { setTurnstileToken(''); setCanSubmit(false); }}
                  theme="light"
                  size="normal"
                />
              </Box>

              {error && <Alert severity="error" sx={{ borderRadius: '8px' }}>{error}</Alert>}

              <Button
                variant="contained"
                fullWidth
                type="submit"
                disabled={loading || !canSubmit}
                sx={{ minHeight: 44, fontWeight: 700, borderRadius: '8px' }}
              >
                {loading ? 'Δημιουργία...' : 'Εγγραφή'}
              </Button>

              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 1 }}>
                Έχεις ήδη λογαριασμό;{' '}
                <MuiLink component={Link} to="/login" underline="hover" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Είσοδος
                </MuiLink>
              </Typography>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
