import React, { useEffect, useState } from 'react';
import { Container, Typography, Card, CardContent, CardActions, Button, Box, CircularProgress, Alert, TextField, Stack, Snackbar, InputAdornment, IconButton, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import MenuItem from '@mui/material/MenuItem';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import { validatePassword } from '../utils/passwordValidation';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Fetch user and profile
  useEffect(() => {
    let ignore = false;
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        setError('Σφάλμα κατά τον έλεγχο σύνδεσης.');
        setLoading(false);
        return;
      }
      if (!data.session) {
        navigate('/login');
      } else {
        setUser(data.session.user);
        // Fetch profile
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        if (!ignore) {
          if (profErr) setError('Σφάλμα ανάκτησης προφίλ.');
          else setProfile(prof);
          setLoading(false);
        }
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });
    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, [navigate]);

  // Handle profile field change
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // Save profile changes
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    const updateObj = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      updated_at: new Date().toISOString(),
    };
    if (user.id === ADMIN_UID) {
      updateObj.role = profile.role;
    }
    const { error: updateErr } = await supabase
      .from('profiles')
      .update(updateObj)
      .eq('id', user.id);
    if (updateErr) setError('Σφάλμα αποθήκευσης: ' + updateErr.message);
    else setSuccess('Τα στοιχεία αποθηκεύτηκαν!');
    setSaving(false);
  };

  // Change password
  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    // Password validation
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      setPasswordError('Ο κωδικός δεν πληροί τις απαιτήσεις ασφαλείας.');
      return;
    }
    
    const { error: passErr } = await supabase.auth.updateUser({ password: newPassword });
    if (passErr) setPasswordError(passErr.message);
    else setPasswordSuccess('Ο κωδικός άλλαξε!');
    setShowPasswordFields(false);
    setNewPassword('');
  };

  if (loading) return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 4 }}>
      <Card variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <CardContent>
          <Typography variant="h5" color="#222" gutterBottom>
            ΠΡΟΦΙΛ ΧΡΗΣΤΗ
          </Typography>
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2, width: '60%' }} />
          </Stack>
        </CardContent>
        <CardActions sx={{ mt: 2 }}>
          <Skeleton variant="rectangular" height={40} width="100%" sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={40} width="100%" sx={{ borderRadius: 2 }} />
        </CardActions>
      </Card>
    </Container>
  );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!user || !profile) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 4 }}>
      <Card
        variant="outlined"
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 5,
          boxShadow: 6,
          background: '#f4f6f8',
          alignItems: 'center',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Box sx={{ mb: 1 }}>
            <Box sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 3,
            }}>
              <PersonIcon sx={{ color: '#fff', fontSize: 48 }} />
            </Box>
          </Box>
          <Typography variant="h5" color="#212121" gutterBottom sx={{ fontWeight: 800, letterSpacing: '-1px', textAlign: 'center' }}>
            ΠΡΟΦΙΛ ΧΡΗΣΤΗ
          </Typography>
          <Typography variant="subtitle1" color="#212121" sx={{ mb: 1, textAlign: 'center' }}>
            {user.email}
          </Typography>
        </Box>
        <Stack spacing={2} sx={{ width: '100%' }}>
          <TextField
            label="ΟΝΟΜΑ"
            name="first_name"
            value={profile.first_name || ''}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="#222" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="ΕΠΩΝΥΜΟ"
            name="last_name"
            value={profile.last_name || ''}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <BadgeIcon color="#222" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Email"
            value={user.email}
            fullWidth
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="#222" />
                </InputAdornment>
              ),
            }}
          />
          {user.id === ADMIN_UID ? (
            <TextField
              select
              label="ΡΟΛΟΣ"
              name="role"
              value={profile.role || 'student'}
              onChange={handleChange}
              fullWidth
              helperText="Μόνο ο admin μπορεί να αλλάξει το ρόλο."
            >
              <MenuItem value="student">ΦΟΙΤΗΤΗΣ</MenuItem>
              <MenuItem value="admin">ADMIN</MenuItem>
            </TextField>
          ) : (
            <TextField
              label="ΡΟΛΟΣ"
              value={profile.role || 'student'}
              fullWidth
              InputProps={{ readOnly: true }}
              helperText={user.id === ADMIN_UID ? 'Μόνο ο admin μπορεί να αλλάξει το ρόλο.' : ''}
            />
          )}
          <Button
            variant="outlined"
            color="#222"
            onClick={() => setShowPasswordFields((v) => !v)}
            fullWidth
            sx={{ fontWeight: 700, py: 1.2, borderRadius: 2 }}
          >
            ΑΛΛΑΓΗ ΚΩΔΙΚΟΥ
          </Button>
          {showPasswordFields && (
            <Card variant="outlined" sx={{ p: 2, borderRadius: 3, background: '#f4f6f8', boxShadow: 2 }}>
              <Stack spacing={1}>
                <TextField
                  label="ΝΕΟΣ ΚΩΔΙΚΟΣ"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((show) => !show)}
                          edge="end"
                          sx={{
                            '&:focus': {
                              outline: 'none',
                              boxShadow: 'none',
                            },
                            '&:focus-visible': {
                              outline: 'none',
                              boxShadow: 'none',
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#212121',
                        borderWidth: '1px',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#212121',
                        borderWidth: '1px',
                        boxShadow: 'none',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'transparent',
                      },
                      '&.MuiInputBase-input': {
                        backgroundColor: 'transparent',
                      },
                    },
                  }}
                />
                <PasswordStrengthIndicator password={newPassword} />
                <Button
                  variant="contained"
                  color="#222"
                  onClick={handlePasswordChange}
                  fullWidth
                  disabled={!validatePassword(newPassword).isValid}
                  sx={{ fontWeight: 700, py: 1.2, borderRadius: 2 }}
                >
                  ΑΠΟΘΗΚΕΥΣΗ ΚΩΔΙΚΟΥ
                </Button>
                {passwordError && <Alert severity="error" sx={{ fontWeight: 600 }}>{passwordError}</Alert>}
                {passwordSuccess && <Alert severity="success" sx={{ fontWeight: 600 }}>{passwordSuccess}</Alert>}
              </Stack>
            </Card>
          )}
          {error && <Alert severity="error" sx={{ fontWeight: 600 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ fontWeight: 600 }}>{success}</Alert>}
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4, width: '100%' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            fullWidth
            disabled={saving}
            sx={{
              fontWeight: 700,
              py: 0,
              borderRadius: 2,
              fontSize: '0.95rem',
              boxShadow: '0 2px 8px rgba(33,33,33,0.08)',
              letterSpacing: 0.5,
              transition: 'background 0.2s, box-shadow 0.2s',
              background: 'linear-gradient(90deg, #1976d2 60%, #42a5f5 100%)',
              color: '#fff',
              '&:hover': {
                background: 'linear-gradient(90deg, #1565c0 60%, #1976d2 100%)',
                boxShadow: '0 4px 16px rgba(33,33,33,0.12)',
              },
              '&:focus': {
                outline: 'none',
                boxShadow: '0 0 0 2px #1976d2',
              },
            }}
          >
            Αποθήκευση στοιχείων
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={async () => { await supabase.auth.signOut(); navigate('/'); }}
            fullWidth
            sx={{
              fontWeight: 700,
              py: 0,
              borderRadius: 2,
              fontSize: '0.95rem',
              letterSpacing: 0.5,
              color: '#d32f2f',
              borderColor: '#d32f2f',
              background: '#fff',
              transition: 'background 0.2s, color 0.2s, border 0.2s',
              '&:hover': {
                background: '#ffebee',
                borderColor: '#b71c1c',
                color: '#b71c1c',
              },
              '&:focus': {
                outline: 'none',
                boxShadow: '0 0 0 2px #d32f2f',
              },
            }}
          >
            Αποσύνδεση
          </Button>
        </Stack>
        <Snackbar
          open={!!success}
          autoHideDuration={3000}
          onClose={() => setSuccess('')}
          message={success}
        />
      </Card>
    </Container>
  );
};

export default Profile; 