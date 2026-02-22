import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, TextField, Button, Paper, Alert, CircularProgress, Stack, useTheme } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const AdminApplication = () => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [user, setUser] = useState(null);
    const { enqueueSnackbar } = useSnackbar();
    const theme = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            const sessionUser = data?.session?.user || null;
            setUser(sessionUser);
            if (sessionUser) {
                setFormData(prev => ({ ...prev, email: sessionUser.email || '' }));
            } else {
                enqueueSnackbar('Πρέπει να συνδεθείτε για να κάνετε αίτηση Admin.', { variant: 'warning' });
                navigate('/login', { state: { returnUrl: '/admin-application' } });
            }
        });
    }, [navigate, enqueueSnackbar]);

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
        if (!formData.message.trim()) newErrors.message = 'Πρέπει να γράψετε γιατί θέλετε να γίνετε Admin';
        else if (formData.message.trim().length < 10) newErrors.message = 'Τουλάχιστον 10 χαρακτήρες';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm() || !user) return;
        setLoading(true);
        try {
            // Check if user has already applied
            const { data: existingApp } = await supabase
                .from('admin_applications')
                .select('id, status')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (existingApp && existingApp.status === 'pending') {
                enqueueSnackbar('Έχετε ξανακάνει αίτηση και εκκρεμεί έγκριση.', { variant: 'info' });
                setLoading(false);
                return;
            }

            const { error } = await supabase.from('admin_applications').insert([
                {
                    user_id: user.id,
                    email: formData.email,
                    name: formData.name,
                    message: formData.message,
                    status: 'pending'
                }
            ]);

            if (error) throw new Error(error.message);

            enqueueSnackbar('Η αίτησή σας υποβλήθηκε επιτυχώς!', { variant: 'success' });
            setFormData({ name: '', email: user.email || '', message: '' });
            setTimeout(() => navigate('/'), 2500);

        } catch (error) {
            console.error(error);
            enqueueSnackbar('Σφάλμα υποβολής. Δοκιμάστε ξανά.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null; // Let the useEffect redirect

    return (
        <Container maxWidth="sm" sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 12, md: 8 } }}>
            <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
                Αίτηση Διαχειριστή (Admin)
            </Typography>
            <Typography align="center" sx={{ color: 'text.secondary', mb: 4, maxWidth: 500, mx: 'auto', fontSize: '0.95rem' }}>
                Συμπληρώστε τη φόρμα για να ζητήσετε δικαιώματα διαχειριστή. Αναφέρετε συνοπτικά γιατί θέλετε να βοηθήσετε την πλατφόρμα.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Paper sx={{ width: '100%', p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: 3 }} component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                        <TextField
                            fullWidth
                            required
                            label="Ονοματεπώνυμο"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            error={!!errors.name}
                            helperText={errors.name}
                        />
                        <TextField
                            fullWidth
                            required
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            InputProps={{ readOnly: true }} // Should match the auth user
                            sx={{ opacity: 0.8 }}
                        />
                        <TextField
                            fullWidth
                            required
                            label="Γιατί θέλετε να γίνετε Admin;"
                            name="message"
                            multiline
                            minRows={5}
                            value={formData.message}
                            onChange={handleChange}
                            error={!!errors.message}
                            helperText={errors.message || 'Αναφέρετε πώς μπορείτε να συνεισφέρετε.'}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                            fullWidth
                            sx={{ py: 1.5, fontSize: '0.938rem', borderRadius: 2, fontWeight: 700, mt: 2 }}
                        >
                            {loading ? 'Υποβολή...' : 'Υποβολή Αίτησης'}
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Container>
    );
};

export default AdminApplication;
