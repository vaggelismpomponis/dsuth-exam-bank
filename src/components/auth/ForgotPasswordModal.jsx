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
import IconButton from '@mui/material/IconButton';
import { Mail, Check, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { getAuthRedirectUrl } from '../../utils/authUtils';
import { getFriendlyErrorMessage } from '../../utils/errorUtils';

export const ForgotPasswordModal = ({ open, onClose, initialEmail = '' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(initialEmail || '');
      setError('');
      setSent(false);
    }
  }, [open, initialEmail]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Παρακαλώ εισάγετε τη διεύθυνση email σας.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const redirectTo = getAuthRedirectUrl('/reset-password');
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo,
      });

      if (resetErr) throw resetErr;

      setSent(true);
    } catch (err) {
      setError(
        getFriendlyErrorMessage(err, 'Σφάλμα κατά την αποστολή email επαναφοράς. Παρακαλούμε δοκιμάστε ξανά.')
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
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
            ΕΠΑΝΑΦΟΡΑ ΠΡΟΣΒΑΣΗΣ
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
            Ξέχασες τον κωδικό σου;
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={loading}
          size="small"
          aria-label="Κλείσιμο"
          sx={{
            color: 'text.secondary',
            bgcolor: 'action.hover',
            borderRadius: '10px',
            p: 0.75,
            '&:hover': { bgcolor: 'action.selected' },
          }}
        >
          <X size={18} />
        </IconButton>
      </Box>

      {sent ? (
        <Box sx={{ my: 2 }}>
          <Alert severity="success" sx={{ borderRadius: '10px', mb: 2.5, fontSize: '0.84rem' }}>
            Σας αποστείλαμε έναν σύνδεσμο επαναφοράς στο <strong>{email.trim()}</strong>. Ελέγξτε τα εισερχόμενά σας (και τον φάκελο Ανεπιθύμητα / Spam).
          </Alert>
          <Button
            variant="contained"
            fullWidth
            onClick={onClose}
            sx={{ py: 1.1, borderRadius: '10px', fontWeight: 700, fontSize: '0.84rem' }}
          >
            Εντάξει, κατάλαβα
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 0, my: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', mb: 2, lineHeight: 1.5 }}>
              Συμπληρώστε το email του λογαριασμού σας για να λάβετε οδηγίες επαναφοράς του κωδικού πρόσβασης.
            </Typography>

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
                  Email Λογαριασμού
                </Typography>
                <TextField
                  autoFocus
                  fullWidth
                  type="email"
                  inputMode="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={loading}
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
              onClick={onClose}
              disabled={loading}
              sx={{
                flex: 1,
                py: 1.1,
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.84rem',
                color: 'text.secondary',
                borderColor: 'divider',
              }}
            >
              Ακύρωση
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={loading || !email.trim()}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Mail size={16} />}
              sx={{
                flex: 1.4,
                py: 1.1,
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.84rem',
              }}
            >
              {loading ? 'Αποστολή...' : 'Αποστολή συνδέσμου'}
            </Button>
          </DialogActions>
        </Box>
      )}
    </Dialog>
  );
};

