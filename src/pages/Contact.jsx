import React, { useState } from 'react';
import {
  Container, Typography, Box, TextField, Button, Paper, Alert,
  CircularProgress, Stack, Divider, useTheme, Chip
} from '@mui/material';
import { Email as EmailIcon, Send as SendIcon, GitHub as GitHubIcon, QuestionAnswer as FAQIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { supabase } from '../supabaseClient';
import { Turnstile } from '@marsidev/react-turnstile';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [turnstileToken, setTurnstileToken] = useState('');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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
        setSent(true);
        enqueueSnackbar('Το μήνυμα στάλθηκε επιτυχώς!', { variant: 'success' });
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTurnstileToken('');
        if (window.turnstile) window.turnstile.reset();
      } else throw new Error(data?.error || 'Unknown error');
    } catch (error) {
      enqueueSnackbar('Σφάλμα αποστολής. Δοκιμάστε ξανά.', { variant: 'error' });
    } finally { setLoading(false); }
  };

  const infoCards = [
    {
      icon: <EmailIcon sx={{ fontSize: 20, color: '#1a73e8' }} />,
      color: '#1a73e8',
      title: 'Email',
      content: 'dsuthexambank@gmail.com',
      href: 'mailto:dsuthexambank@gmail.com',
      linkLabel: 'Στείλε email',
    },
    {
      icon: <FAQIcon sx={{ fontSize: 20, color: '#1e8e3e' }} />,
      color: '#1e8e3e',
      title: 'FAQ',
      content: 'Δες τις συχνές ερωτήσεις πριν επικοινωνήσεις μαζί μας.',
      href: '/faq',
      linkLabel: 'Δες FAQ',
    },
    {
      icon: <GitHubIcon sx={{ fontSize: 20, color: isDark ? '#e8eaed' : '#24292f' }} />,
      color: isDark ? '#e8eaed' : '#24292f',
      title: 'GitHub',
      content: 'Open source — δες τον κώδικα ή κάνε contribution.',
      href: 'https://github.com/vaggelismpomponis/dsuth-exam-bank',
      target: '_blank',
      linkLabel: 'Repository',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 6 }, pb: { xs: 12, md: 8 } }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Chip
          label="Επικοινωνία"
          size="small"
          sx={{
            mb: 2,
            bgcolor: isDark ? 'rgba(26,115,232,0.12)' : 'rgba(26,115,232,0.08)',
            color: isDark ? '#8ab4f8' : '#1a73e8',
            fontWeight: 700,
            fontSize: '0.75rem',
            border: '1px solid',
            borderColor: isDark ? 'rgba(26,115,232,0.25)' : 'rgba(26,115,232,0.2)',
          }}
        />
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em', mb: 1, fontSize: { xs: '1.8rem', md: '2.2rem' } }}
        >
          Μιλήστε μαζί μας
        </Typography>
        <Typography sx={{ color: 'text.secondary', maxWidth: 440, mx: 'auto', fontSize: '0.95rem', lineHeight: 1.65 }}>
          Έχεις απορία, πρόταση ή πρόβλημα; Γράψε μας και θα σε βοηθήσουμε.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
        {/* Form */}
        <Box sx={{ flex: 1 }}>
          <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: '20px',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
              boxShadow: isDark ? 'none' : '0 4px 24px rgba(0,0,0,0.05)',
            }}
          >
            {sent ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Box sx={{
                  width: 64, height: 64, borderRadius: '50%',
                  bgcolor: isDark ? 'rgba(30,142,62,0.15)' : 'rgba(30,142,62,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  mx: 'auto', mb: 2,
                }}>
                  <SendIcon sx={{ color: '#1e8e3e', fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                  Στάλθηκε επιτυχώς!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Θα σου απαντήσουμε το συντομότερο δυνατό.
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 3, borderRadius: '10px' }}
                  onClick={() => setSent(false)}
                >
                  Νέο μήνυμα
                </Button>
              </Box>
            ) : (
              <Stack spacing={2.5}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: -0.5, fontSize: '1rem' }}>
                  Φόρμα Επικοινωνίας
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField fullWidth required label="Όνομα" name="name" value={formData.name} onChange={handleChange} error={!!errors.name} helperText={errors.name} />
                  <TextField fullWidth required label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} />
                </Box>
                <TextField fullWidth required label="Θέμα" name="subject" value={formData.subject} onChange={handleChange} error={!!errors.subject} helperText={errors.subject} />
                <TextField fullWidth required label="Μήνυμα" name="message" multiline minRows={5} value={formData.message} onChange={handleChange} error={!!errors.message} helperText={errors.message} />

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Turnstile
                    siteKey="0x4AAAAAABiQtKNjlTVw7zFL"
                    onSuccess={(token) => { setTurnstileToken(token); if (errors.turnstile) setErrors(p => ({ ...p, turnstile: '' })); }}
                    onExpire={() => setTurnstileToken('')}
                    onError={() => setTurnstileToken('')}
                    theme={isDark ? 'dark' : 'light'}
                  />
                </Box>
                {errors.turnstile && <Typography variant="caption" color="error" textAlign="center">{errors.turnstile}</Typography>}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
                  sx={{
                    py: 1.4,
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.938rem',
                    background: 'linear-gradient(135deg, #1a73e8, #0052cc)',
                    '&:hover': { background: 'linear-gradient(135deg, #1557b0, #003ea8)' },
                  }}
                >
                  {loading ? 'Αποστολή...' : 'Αποστολή Μηνύματος'}
                </Button>
              </Stack>
            )}
          </Paper>
        </Box>

        {/* Sidebar */}
        <Box sx={{ width: { xs: '100%', lg: 300 }, flexShrink: 0 }}>
          <Stack spacing={2}>
            {infoCards.map((card) => (
              <Box
                key={card.title}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: `${card.color}40`,
                    boxShadow: isDark ? `0 4px 20px rgba(0,0,0,0.3)` : `0 4px 20px rgba(0,0,0,0.07)`,
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Box sx={{
                    width: 36, height: 36, borderRadius: '10px',
                    bgcolor: `${card.color}12`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {card.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                    {card.title}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.83rem', mb: 1.5, lineHeight: 1.55 }}>
                  {card.content}
                </Typography>
                <Box
                  component="a"
                  href={card.href}
                  target={card.target}
                  rel={card.target ? 'noopener noreferrer' : undefined}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: card.color,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {card.linkLabel} →
                </Box>
              </Box>
            ))}

            {/* Response time info */}
            <Box
              sx={{
                p: 2,
                borderRadius: '14px',
                bgcolor: isDark ? 'rgba(26,115,232,0.07)' : 'rgba(26,115,232,0.04)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.12)',
              }}
            >
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6 }}>
                💬 Συνήθως απαντάμε εντός <strong style={{ color: isDark ? '#8ab4f8' : '#1a73e8' }}>24-48 ωρών</strong>. Για επείγοντα στείλε email απευθείας.
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
};

export default Contact;