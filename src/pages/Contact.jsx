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
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Subject as SubjectIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

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
      // Simulate API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
      
    } catch (error) {
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
      <Container maxWidth="lg">
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

        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid item xs={12} lg={8}>
            <Paper 
              elevation={0}
              sx={{ 
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #e3eafc',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 3, 
                  color: '#212121',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <SendIcon sx={{ color: '#1976d2' }} />
                Στείλτε μας μήνυμα
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Όνομα"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#666' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#666' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Θέμα"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      error={!!errors.subject}
                      helperText={errors.subject}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SubjectIcon sx={{ color: '#666' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Μήνυμα"
                      name="message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      error={!!errors.message}
                      helperText={errors.message}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover fieldset': {
                            borderColor: '#1976d2',
                          },
                        },
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
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
                        borderRadius: 2,
                        backgroundColor: '#1976d2',
                        color: '#fff',
                        boxShadow: 'none',
                        transition: 'background 0.2s, color 0.2s',
                        '&:hover': {
                          backgroundColor: '#115293',
                          color: '#fff',
                          boxShadow: 'none',
                        },
                        '&:disabled': {
                          backgroundColor: '#ccc',
                          color: '#666',
                        },
                        minHeight: 48,
                        textTransform: 'none',
                      }}
                    >
                      {loading ? 'Αποστολή...' : 'Αποστολή Μηνύματος'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PhoneIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121' }}>
                          Τηλέφωνο
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          +30 24210 74900
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LocationIcon sx={{ color: '#1976d2', fontSize: 20 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#212121' }}>
                          Διεύθυνση
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Πανεπιστημιούπολη, Βόλος
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
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact; 