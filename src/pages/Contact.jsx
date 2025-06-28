import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Email as EmailIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
  GitHub as GitHubIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { supabase } from '../supabaseClient';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Το όνομά σας είναι υποχρεωτικό';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Το email είναι υποχρεωτικό';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Παρακαλώ εισάγετε έγκυρο email';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Το θέμα είναι υποχρεωτικό';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Το μήνυμα είναι υποχρεωτικό';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Το μήνυμα πρέπει να έχει τουλάχιστον 10 χαρακτήρες';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        enqueueSnackbar('Το μήνυμά σας στάλθηκε επιτυχώς! Θα σας απαντήσουμε σύντομα.', { 
          variant: 'success' 
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
      
    } catch (error) {
      console.error('Error sending email:', error);
      enqueueSnackbar('Σφάλμα στην αποστολή του μηνύματος. Παρακαλώ δοκιμάστε ξανά.', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f0ff 0%, #f9fbff 100%)',
      py: { xs: 4, md: 6 },
      px: { xs: 2, sm: 3 }
    }}>
      <Container maxWidth={false} sx={{ maxWidth: '100%', px: { xs: 0, sm: 2 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 800, 
              mb: 2, 
              color: '#212121',
              fontSize: { xs: '2rem', md: '3rem' }
            }}
          >
            Επικοινωνήστε μαζί μας
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#666', 
              maxWidth: 600, 
              mx: 'auto',
              fontWeight: 400
            }}
          >
            Έχετε απορίες, προτάσεις ή χρειάζεστε βοήθεια; Στείλτε μας το μήνυμά σας και θα σας απαντήσουμε άμεσα.
          </Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: 'flex-start',
          justifyContent: 'center',
          gap: { xs: 4, lg: 6 },
          width: '100%',
          maxWidth: 1400,
          mx: 'auto',
        }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3, md: 5 },
              borderRadius: 6,
              background: 'linear-gradient(135deg, #fafdff 60%, #e3f0ff 100%)',
              boxShadow: '0 6px 32px 0 rgba(25, 118, 210, 0.10), 0 1.5px 8px 0 rgba(25, 118, 210, 0.04) inset',
              border: 'none',
              backdropFilter: 'blur(2px)',
              minHeight: 320,
              transition: 'box-shadow 0.2s',
              width: { xs: '100%', sm: 500, md: 700, lg: 800 },
              maxWidth: { xs: '100%', sm: 500, md: 700, lg: 800 },
              flexShrink: 0,
              mx: 'auto',
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 700, 
                mb: 3, 
                color: '#1976d2',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <SendIcon sx={{ color: '#1976d2' }} />
              Φόρμα Επικοινωνίας
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }} autoComplete="on" noValidate>
              <TextField
                fullWidth
                required
                label="Όνομα"
                name="name"
                autoComplete="name"
                aria-label="Όνομα"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    background: '#f8fafc',
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                      borderWidth: 2,
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                aria-label="Email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    background: '#f8fafc',
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                      borderWidth: 2,
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                required
                label="Θέμα"
                name="subject"
                autoComplete="off"
                aria-label="Θέμα"
                value={formData.subject}
                onChange={handleChange}
                error={!!errors.subject}
                helperText={errors.subject}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SubjectIcon sx={{ color: '#1976d2' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    background: '#f8fafc',
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                      borderWidth: 2,
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                required
                label="Μήνυμα"
                name="message"
                multiline
                minRows={6}
                autoComplete="off"
                aria-label="Μήνυμα"
                value={formData.message}
                onChange={handleChange}
                error={!!errors.message}
                helperText={errors.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    background: '#f8fafc',
                    '&.Mui-focused fieldset': {
                      borderColor: '#1976d2',
                      borderWidth: 2,
                    },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                sx={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2.5,
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(25, 118, 210, 0.10)',
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    backgroundColor: '#115293',
                    color: '#fff',
                    boxShadow: '0 4px 16px rgba(25, 118, 210, 0.13)',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    color: '#666',
                  },
                  minHeight: 52,
                  textTransform: 'none',
                  letterSpacing: 0.5,
                }}
              >
                {loading ? 'Αποστολή...' : 'Αποστολή Μηνύματος'}
              </Button>
            </Box>
          </Paper>

          <Box sx={{ flex: 1, minWidth: { xs: '100%', lg: 320 }, maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 3, mt: { xs: 4, lg: 0 } }}>
            {/* Info Card */}
            <Card 
              sx={{ 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                border: '1px solid #e1f5fe',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3, 
                    color: '#212121',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <EmailIcon sx={{ color: '#1976d2' }} />
                  Πληροφορίες Επικοινωνίας
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <EmailIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121' }}>
                        Email
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        info@dsuth.gr
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* FAQ Card */}
            <Card 
              sx={{ 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #fff3e0 0%, #fbe9e7 100%)',
                border: '1px solid #fff3e0',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 2, 
                    color: '#212121'
                  }}
                >
                  Συχνές Ερωτήσεις
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                  Βρείτε γρήγορα απαντήσεις σε συχνές ερωτήσεις πριν επικοινωνήσετε μαζί μας.
                </Typography>
                <Button 
                  variant="outlined" 
                  href="/faq"
                  sx={{ 
                    borderColor: '#f57c00', 
                    color: '#f57c00',
                    '&:hover': { 
                      borderColor: '#e65100', 
                      backgroundColor: 'rgba(245, 124, 0, 0.04)' 
                    },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Δες FAQ
                </Button>
              </CardContent>
            </Card>

            {/* GitHub Card */}
            <Card 
              sx={{ 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #24292e 0%, #2f363d 100%)',
                border: '1px solid #444d56',
                color: 'white',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 2, 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <GitHubIcon sx={{ color: 'white' }} />
                  Ακολουθήστε μας
                </Typography>
                <Typography variant="body2" sx={{ color: '#c9d1d9', mb: 2 }}>
                  Βρείτε τον κώδικα του project μας στο GitHub και μείνετε ενημερωμένοι για τις τελευταίες εξελίξεις.
                </Typography>
                <Button 
                  variant="outlined" 
                  href="https://github.com/vaggelismpomponis/dsuth-exam-bank"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ 
                    borderColor: '#c9d1d9', 
                    color: '#c9d1d9',
                    '&:hover': { 
                      borderColor: 'white', 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white'
                    },
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  GitHub Repository
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Contact; 