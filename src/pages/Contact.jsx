import React, { useState } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Alert, CircularProgress, Stack, Card, CardContent } from '@mui/material';
import { Email as EmailIcon, Send as SendIcon, GitHub as GitHubIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { supabase } from '../supabaseClient';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTheme } from '@mui/material/styles';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { enqueueSnackbar } = useSnackbar();
  const [turnstileToken, setTurnstileToken] = useState('');
  const theme = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Το όνομα είναι υποχρεωτικό';
    if (!formData.email.trim()) newErrors.email = 'Το email είναι υποχρεωτικό';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Μη έγκυρο email';
    if (!formData.subject.trim()) newErrors.subject = 'Το θέμα είναι υποχρεωτικό';
    if (!formData.message.trim()) newErrors.message = 'Το μήνυμα είναι υποχρεωτικό';
    else if (formData.message.trim().length < 10) newErrors.message = 'Τουλάχιστον 10 χαρακτήρες';
    if (!turnstileToken) newErrors.turnstile = 'Ολοκληρώστε την επαλήθευση';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: { ...formData, turnstileToken }
      });
      if (error) throw new Error(error.message);
      if (data?.success) {
        enqueueSnackbar('Το μήνυμα στάλθηκε επιτυχώς!', { variant: 'success' });
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTurnstileToken('');
        if (window.turnstile) window.turnstile.reset();
      } else throw new Error(data?.error || 'Unknown error');
    } catch (error) {
      enqueueSnackbar('Σφάλμα αποστολής. Δοκιμάστε ξανά.', { variant: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 2, md: 5 }, pb: { xs: 12, md: 5 } }}>
      <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
        Επικοινωνία
      </Typography>
      <Typography align="center" sx={{ color: 'text.secondary', mb: 4, maxWidth: 500, mx: 'auto', fontSize: '0.95rem' }}>
        Στείλτε μας τις απορίες ή τις προτάσεις σας
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, justifyContent: 'center' }}>
        {/* Form */}
        <Paper sx={{ flex: 1, maxWidth: 560, p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }} component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField fullWidth required label="Όνομα" name="name" value={formData.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} />
            <TextField fullWidth required label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} />
            <TextField fullWidth required label="Θέμα" name="subject" value={formData.subject} onChange={handleChange} error={!!errors.subject} helperText={errors.subject} />
            <TextField fullWidth required label="Μήνυμα" name="message" multiline minRows={5} value={formData.message} onChange={handleChange} error={!!errors.message} helperText={errors.message} />

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Turnstile
                siteKey="0x4AAAAAABiQtKNjlTVw7zFL"
                onSuccess={(token) => { setTurnstileToken(token); if (errors.turnstile) setErrors(p => ({ ...p, turnstile: '' })); }}
                onExpire={() => setTurnstileToken('')}
                onError={() => setTurnstileToken('')}
                theme={theme.palette.mode}
              />
            </Box>
            {errors.turnstile && <Typography variant="caption" color="error" textAlign="center">{errors.turnstile}</Typography>}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              fullWidth
              sx={{ py: 1.3, fontSize: '0.938rem' }}
            >
              {loading ? 'Αποστολή...' : 'Αποστολή'}
            </Button>
          </Stack>
        </Paper>

        {/* Sidebar Info */}
        <Stack spacing={2} sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>Επικοινωνία</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <EmailIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>info@dsuth.gr</Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>FAQ</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                Δείτε τις συχνές ερωτήσεις πριν επικοινωνήσετε.
              </Typography>
              <Button variant="outlined" size="small" href="/faq">Δες FAQ</Button>
            </CardContent>
          </Card>

          <Card sx={{ border: '1px solid', borderColor: 'divider', bgcolor: theme.palette.mode === 'light' ? '#fff' : '#1e1e1e' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <GitHubIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>GitHub</Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                Δείτε τον κώδικα του project.
              </Typography>
              <Button variant="outlined" size="small" href="https://github.com/vaggelismpomponis/dsuth-exam-bank" target="_blank" rel="noopener">
                Repository
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    </Container>
  );
};

export default Contact;