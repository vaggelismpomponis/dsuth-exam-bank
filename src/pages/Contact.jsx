import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import { Mail, HelpCircle } from 'lucide-react';
import { useSnackbar } from 'notistack';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Turnstile } from '@marsidev/react-turnstile';
import { ContactFaq } from '../components/contact/ContactFaq';

const INFO_CARDS = [
  {
    icon: <Mail size={22} color="var(--mui-palette-primary-main, #1a73e8)" />,
    title: 'Ηλεκτρονικό Ταχυδρομείο',
    content: 'dsuthexambank@gmail.com',
    href: 'mailto:dsuthexambank@gmail.com',
    linkLabel: 'Αποστολή email',
  },
  {
    icon: <HelpCircle size={22} color="var(--mui-palette-primary-main, #1a73e8)" />,
    title: 'Συχνές Ερωτήσεις (FAQ)',
    content: 'Βρείτε άμεσες απαντήσεις για τη λειτουργία και τους κανόνες της πλατφόρμας.',
    href: '#faq',
    isAnchor: true,
    linkLabel: 'Προβολή FAQ',
  },
];

const Contact = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [turnstileToken, setTurnstileToken] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#faq') {
      const el = document.getElementById('faq');
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, [location.hash]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
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
        body: { ...formData, turnstileToken },
      });
      if (error) throw new Error(error.message);
      if (data?.success) {
        enqueueSnackbar('Το μήνυμα στάλθηκε επιτυχώς!', { variant: 'success' });
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTurnstileToken('');
        if (window.turnstile) window.turnstile.reset();
      } else {
        throw new Error(data?.error || 'Unknown error');
      }
    } catch {
      enqueueSnackbar('Σφάλμα αποστολής. Δοκιμάστε ξανά.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (card) => {
    if (card.isAnchor) {
      const el = document.getElementById('faq');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default', pb: { xs: 10, md: 8 } }}>
      <Box component="header" sx={{ width: '100%', bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider', pt: { xs: 4, sm: 6 }, pb: { xs: 4, sm: 5 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
          <Typography component="span" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'primary.main', mb: 1.5 }}>
            ΥΠΟΣΤΗΡΙΞΗ & ΕΠΙΚΟΙΝΩΝΙΑ
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.875rem', sm: '2.5rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 1 }}>
            Επικοινωνία με την Ομάδα
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 640 }}>
            Έχετε απορίες, παρατηρήσεις ή προτάσεις βελτίωσης; Στείλτε μας μήνυμα και θα σας απαντήσουμε άμεσα.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 }, pt: { xs: 4, md: 5 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.3fr' }, gap: 4 }}>
          <Stack spacing={2.5}>
            {INFO_CARDS.map((card) => (
              <Paper key={card.title} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <Box sx={{ mb: 1.5 }}>{card.icon}</Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{card.title}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{card.content}</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  href={card.href}
                  target={card.target}
                  rel={card.target ? 'noopener noreferrer' : undefined}
                  onClick={() => handleCardClick(card)}
                  sx={{ borderRadius: '8px' }}
                >
                  {card.linkLabel}
                </Button>
              </Paper>
            ))}
          </Stack>

          <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }} component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>Φόρμα Μηνύματος</Typography>
            <Stack spacing={2}>
              <TextField label="Ονοματεπώνυμο" name="name" fullWidth value={formData.name} onChange={handleChange} error={Boolean(errors.name)} helperText={errors.name} />
              <TextField label="Διεύθυνση Email" name="email" type="email" inputMode="email" fullWidth value={formData.email} onChange={handleChange} error={Boolean(errors.email)} helperText={errors.email} />
              <TextField label="Θέμα" name="subject" fullWidth value={formData.subject} onChange={handleChange} error={Boolean(errors.subject)} helperText={errors.subject} />
              <TextField label="Μήνυμα" name="message" multiline minRows={4} fullWidth value={formData.message} onChange={handleChange} error={Boolean(errors.message)} helperText={errors.message} />

              <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                <Turnstile
                  siteKey="0x4AAAAAABiQtKNjlTVw7zFL"
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken('')}
                  onError={() => setTurnstileToken('')}
                  theme={theme.palette.mode === 'dark' ? 'dark' : 'light'}
                  size="normal"
                />
              </Box>

              <Button type="submit" variant="contained" disabled={loading} sx={{ minHeight: 44, borderRadius: '8px', fontWeight: 600 }}>
                {loading ? 'Αποστολή...' : 'Αποστολή Μηνύματος'}
              </Button>
            </Stack>
          </Paper>
        </Box>

        {/* FAQ Section at bottom */}
        <ContactFaq />
      </Container>
    </Box>
  );
};

export default Contact;
