import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useSnackbar } from 'notistack';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminApplication = () => {
  const [formData, setFormData] = useState({ name: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data?.session?.user || null;
      setUser(sessionUser);
      if (!sessionUser) {
        enqueueSnackbar('Πρέπει να συνδεθείτε για να κάνετε αίτηση Admin.', { variant: 'warning' });
        navigate('/login', { state: { returnUrl: '/admin-application' } });
      }
    });
  }, [navigate, enqueueSnackbar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Το όνομα είναι υποχρεωτικό';
    if (!formData.message.trim()) newErrors.message = 'Αναφέρετε συνοπτικά τον λόγο της αίτησης';
    else if (formData.message.trim().length < 10) newErrors.message = 'Τουλάχιστον 10 χαρακτήρες';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !user) return;
    setLoading(true);
    try {
      const { data: existingApp } = await supabase
        .from('admin_applications')
        .select('id, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingApp && existingApp.status === 'pending') {
        enqueueSnackbar('Έχετε ήδη υποβάλει αίτηση που εκκρεμεί προς έγκριση.', { variant: 'info' });
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('admin_applications').insert([
        {
          user_id: user.id,
          email: user.email,
          name: formData.name,
          message: formData.message,
          status: 'pending',
        },
      ]);

      if (error) throw new Error(error.message);

      enqueueSnackbar('Η αίτησή σας υποβλήθηκε επιτυχώς!', { variant: 'success' });
      setFormData({ name: '', message: '' });
      setTimeout(() => navigate('/'), 2000);
    } catch {
      enqueueSnackbar('Σφάλμα υποβολής. Δοκιμάστε ξανά.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default', pb: { xs: 10, md: 8 } }}>
      <Box component="header" sx={{ width: '100%', bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider', pt: { xs: 4, sm: 6 }, pb: { xs: 4, sm: 5 } }}>
        <Container maxWidth="sm" sx={{ px: { xs: 2.5, sm: 4 } }}>
          <Typography component="span" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'primary.main', mb: 1.5 }}>
            ΔΙΑΧΕΙΡΙΣΗ ΠΛΑΤΦΟΡΜΑΣ • DSUth
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.875rem', sm: '2.5rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 1 }}>
            Αίτηση Διαχειριστή
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Συμπληρώστε τα στοιχεία σας για να ζητήσετε δικαιώματα έγκρισης και διαχείρισης αρχείων.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="sm" sx={{ px: { xs: 2.5, sm: 4 }, pt: 4 }}>
        <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }} component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <TextField
              label="Ονοματεπώνυμο"
              name="name"
              fullWidth
              value={formData.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />

            <TextField
              label="Λόγος αίτησης & συνεισφορά"
              name="message"
              multiline
              minRows={4}
              fullWidth
              value={formData.message}
              onChange={handleChange}
              error={Boolean(errors.message)}
              helperText={errors.message || 'Περιγράψτε συνοπτικά πώς επιθυμείτε να συνεισφέρετε στην κοινότητα.'}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ minHeight: 44, borderRadius: '8px', fontWeight: 600 }}
            >
              {loading ? 'Υποβολή...' : 'Υποβολή Αίτησης'}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminApplication;
