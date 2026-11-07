import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { Check, LogOut, User } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { supabase } from '../../supabaseClient';
import { getFriendlyErrorMessage } from '../../utils/errorUtils';

export const CompleteProfileModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  const checkUserProfile = async (currentUser) => {
    if (!currentUser || (typeof window !== 'undefined' && window.location.pathname === '/reset-password')) {
      setIsOpen(false);
      setUser(null);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', currentUser.id)
        .maybeSingle();

      const hasFirst = Boolean(profile?.first_name?.trim());
      const hasLast = Boolean(profile?.last_name?.trim());

      if (hasFirst && hasLast) {
        setIsOpen(false);
        return;
      }

      // Check metadata if profile was missing or empty
      let metaFirst = (currentUser.user_metadata?.first_name || currentUser.user_metadata?.given_name || '').trim();
      let metaLast = (currentUser.user_metadata?.last_name || currentUser.user_metadata?.family_name || '').trim();

      if (!metaFirst && !metaLast && currentUser.user_metadata?.full_name) {
        const parts = currentUser.user_metadata.full_name.trim().split(/\s+/);
        if (parts.length >= 2) {
          metaFirst = parts[0];
          metaLast = parts.slice(1).join(' ');
        } else if (parts.length === 1) {
          metaFirst = parts[0];
        }
      }

      // If both metadata names exist, try auto-syncing to profiles
      if (metaFirst && metaLast) {
        // Try update first (avoids Postgres INSERT RLS evaluation)
        const { data: updated, error: updateErr } = await supabase
          .from('profiles')
          .update({
            first_name: metaFirst,
            last_name: metaLast,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentUser.id)
          .select('id');

        if (!updateErr && updated && updated.length > 0) {
          setIsOpen(false);
          return;
        }

        // If row doesn't exist yet, try upsert
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          id: currentUser.id,
          email: currentUser.email,
          first_name: metaFirst,
          last_name: metaLast,
          role: 'student',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        if (!upsertErr) {
          setIsOpen(false);
          return;
        }
      }

      // Names still missing: trigger modal
      setUser(currentUser);
      setFirstName(profile?.first_name || metaFirst || '');
      setLastName(profile?.last_name || metaLast || '');
      setError('');
      setIsOpen(true);
    } catch (err) {
      console.warn('Profile check notice:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) checkUserProfile(data?.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) checkUserProfile(session?.user || null);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      setError('Παρακαλώ συμπληρώστε τόσο το όνομα όσο και το επώνυμο.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // 1. Try UPDATE on profiles first (matches FOR UPDATE policy without triggering INSERT RLS check)
      const { data: updatedRows, error: updateErr } = await supabase
        .from('profiles')
        .update({
          first_name: trimmedFirst,
          last_name: trimmedLast,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('id');

      // If update failed or row didn't exist in profiles yet, try upsert
      if (updateErr || !updatedRows || updatedRows.length === 0) {
        console.warn('Profile update notice, attempting upsert fallback:', updateErr);
        const { error: upsertErr } = await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          first_name: trimmedFirst,
          last_name: trimmedLast,
          role: 'student',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

        if (upsertErr && updateErr) {
          throw updateErr || upsertErr;
        }
      }

      // 2. Always sync user_metadata in Supabase Auth
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          first_name: trimmedFirst,
          last_name: trimmedLast,
          full_name: `${trimmedFirst} ${trimmedLast}`,
        },
      });

      if (authErr) {
        console.warn('Auth metadata update notice:', authErr);
      }

      enqueueSnackbar('Τα στοιχεία σας καταχωρήθηκαν επιτυχώς!', { variant: 'success' });
      setIsOpen(false);

      window.dispatchEvent(new CustomEvent('profile-completed', {
        detail: { first_name: trimmedFirst, last_name: trimmedLast },
      }));
    } catch (err) {
      console.error('CompleteProfileModal save error:', err);
      setError(
        getFriendlyErrorMessage(
          err,
          'Παρουσιάστηκε σφάλμα κατά την αποθήκευση των στοιχείων σας. Παρακαλούμε δοκιμάστε ξανά.'
        )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) localStorage.removeItem(key);
    });
    window.location.href = '/';
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      disableEscapeKeyDown
      onClose={(_, reason) => {
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
      }}
      fullWidth
      maxWidth="xs"
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(8px)',
            bgcolor: 'rgba(0, 0, 0, 0.65)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: { xs: 2.5, sm: 3 },
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.25)',
        },
      }}
    >
      <DialogTitle sx={{ p: 0, mb: 1 }}>
        <Typography
          component="span"
          sx={{
            display: 'block',
            fontSize: '0.6875rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: 'primary.main',
            mb: 0.5,
          }}
        >
          ΑΠΑΙΤΟΥΜΕΝΑ ΣΤΟΙΧΕΙΑ
        </Typography>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.2rem',
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
          }}
        >
          Συμπλήρωση Προφίλ
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.8125rem',
            mt: 0.5,
            lineHeight: 1.5,
          }}
        >
          Για να συνεχίσετε στην πλατφόρμα, είναι υποχρεωτικό να δηλώσετε το ονοματεπώνυμό σας.
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSave}>
        <DialogContent sx={{ p: 0, my: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'text.secondary',
                  mb: 0.75,
                }}
              >
                Όνομα
              </Typography>
              <TextField
                autoFocus
                fullWidth
                placeholder="π.χ. Γεώργιος"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                disabled={saving}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                component="label"
                sx={{
                  display: 'block',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'text.secondary',
                  mb: 0.75,
                }}
              >
                Επώνυμο
              </Typography>
              <TextField
                fullWidth
                placeholder="π.χ. Παπαδόπουλος"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                disabled={saving}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
            </Box>

            {error && (
              <Alert severity="error" sx={{ borderRadius: '8px', fontSize: '0.8125rem' }}>
                {error}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 0, pt: 1, display: 'flex', gap: 1.5 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={handleLogout}
            disabled={saving}
            startIcon={<LogOut size={15} />}
            sx={{
              flex: 1,
              py: 1.1,
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.84rem',
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'action.hover',
              },
            }}
          >
            Αποσύνδεση
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={saving || !firstName.trim() || !lastName.trim()}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Check size={16} />}
            sx={{
              flex: 1.3,
              py: 1.1,
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.84rem',
            }}
          >
            {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

