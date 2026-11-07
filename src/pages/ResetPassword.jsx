import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { supabase } from '../supabaseClient';
import { validatePassword } from '../utils/passwordValidation';
import { getFriendlyErrorMessage } from '../utils/errorUtils';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { AppLogo } from '../components/common/AppLogo';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    let mounted = true;

    // Check if recovery session is active or hash contains recovery token
    const hash = window.location.hash || '';
    const isRecoveryHash = hash.includes('type=recovery') || hash.includes('access_token=');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        if (session || isRecoveryHash) {
          setHasValidSession(true);
        } else {
          setHasValidSession(false);
        }
        setCheckingSession(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        if (event === 'PASSWORD_RECOVERY' || session) {
          setHasValidSession(true);
        }
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setError('Ο νέος κωδικός πρόσβασης δεν πληροί τις προδιαγραφές ασφαλείας.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Οι κωδικοί πρόσβασης δεν ταιριάζουν.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateErr } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateErr) throw updateErr;

      setSuccess(true);
      enqueueSnackbar('Ο κωδικός πρόσβασής σας άλλαξε επιτυχώς!', { variant: 'success' });

      // Sign out recovery session and redirect to login after short delay
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('Signout notice:', e);
        }
        navigate('/login', { state: { passwordReset: true } });
      }, 1500);
    } catch (err) {
      setError(
        getFriendlyErrorMessage(err, 'Σφάλμα κατά την αλλαγή του κωδικού πρόσβασης. Παρακαλούμε δοκιμάστε ξανά.')
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <Box sx={{ minHeight: 'calc(100dvh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ minHeight: 'calc(100dvh - 64px)', display: 'flex', bgcolor: 'background.default', alignItems: 'center', justifyContent: 'center', px: { xs: 2.5, sm: 4 }, py: 6 }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ mb: 2 }}>
            <AppLogo size={36} showText={true} />
          </Box>
          <Typography component="span" sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'primary.main', mb: 1, display: 'block' }}>
            ΑΣΦΑΛΕΙΑ ΛΟΓΑΡΙΑΣΜΟΥ
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 0.5 }}>
            Ορισμός Νέου Κωδικού
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
            Εισάγετε τον νέο κωδικό πρόσβασης για τον λογαριασμό σας.
          </Typography>
        </Box>

        {!hasValidSession && !success ? (
          <Box>
            <Alert severity="warning" sx={{ borderRadius: '10px', mb: 3, fontSize: '0.84rem' }}>
              Ο σύνδεσμος επαναφοράς κωδικού δεν είναι έγκυρος ή έχει λήξει. Παρακαλούμε ζητήστε νέο σύνδεσμο από τη σελίδα σύνδεσης.
            </Alert>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              fullWidth
              startIcon={<ArrowLeft size={16} />}
              sx={{ minHeight: 44, fontWeight: 700, borderRadius: '8px' }}
            >
              Επιστροφή στη Σύνδεση
            </Button>
          </Box>
        ) : success ? (
          <Box>
            <Alert severity="success" sx={{ borderRadius: '10px', mb: 3, fontSize: '0.84rem' }}>
              Ο κωδικός σας ενημερώθηκε επιτυχώς! Μεταφέρεστε στη σελίδα σύνδεσης...
            </Alert>
            <Button
              component={Link}
              to="/login"
              variant="contained"
              fullWidth
              sx={{ minHeight: 44, fontWeight: 700, borderRadius: '8px' }}
            >
              Σύνδεση τώρα
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <Box>
                <TextField
                  label="Νέος κωδικός πρόσβασης"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
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
                <PasswordStrengthIndicator password={password} showRequirements={true} />
              </Box>

              <TextField
                label="Επιβεβαίωση νέου κωδικού"
                type={showConfirmPassword ? 'text' : 'password'}
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="Εμφάνιση κωδικού" onClick={() => setShowConfirmPassword((s) => !s)} edge="end" size="small">
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {error && (
                <Alert severity="error" sx={{ borderRadius: '8px', fontSize: '0.8125rem' }}>
                  {error}
                </Alert>
              )}

              <Button
                variant="contained"
                fullWidth
                type="submit"
                disabled={loading || !password || !confirmPassword}
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Lock size={16} />}
                sx={{ minHeight: 44, fontWeight: 700, borderRadius: '8px', mt: 1 }}
              >
                {loading ? 'Αποθήκευση...' : 'Αποθήκευση Νέου Κωδικού'}
              </Button>

              <Box sx={{ textAlign: 'center', pt: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  variant="text"
                  size="small"
                  startIcon={<ArrowLeft size={14} />}
                  sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.8125rem' }}
                >
                  Επιστροφή στη Σύνδεση
                </Button>
              </Box>
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ResetPassword;

