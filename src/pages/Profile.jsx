import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, TextField, Stack, Alert, InputAdornment, IconButton, Skeleton, Paper, Divider, Avatar, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import { validatePassword } from '../utils/passwordValidation';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';
import { isUserAdminSync } from '../utils/adminUtils';
import { downloadFile } from '../utils/nativeDownload';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) { setError('Σφάλμα κατά τον έλεγχο σύνδεσης.'); setLoading(false); return; }
      if (!data.session) { navigate('/login'); }
      else {
        setUser(data.session.user);
        const { data: prof, error: profErr } = await supabase.from('profiles').select('*').eq('id', data.session.user.id).single();
        if (!ignore) {
          if (profErr) setError('Σφάλμα ανάκτησης προφίλ.');
          else setProfile(prof);
          setLoading(false);
        }
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate('/login'); else setUser(session.user);
    });
    return () => { ignore = true; listener?.subscription.unsubscribe(); };
  }, [navigate]);

  const handleChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    const updateObj = { first_name: profile.first_name, last_name: profile.last_name, updated_at: new Date().toISOString() };
    if (isUserAdminSync(user, profile)) updateObj.role = profile.role;
    const { error: updateErr } = await supabase.from('profiles').update(updateObj).eq('id', user.id);
    if (updateErr) setError('Σφάλμα αποθήκευσης: ' + updateErr.message);
    else setSuccess('Τα στοιχεία αποθηκεύτηκαν!');
    setSaving(false);
  };

  const handlePasswordChange = async () => {
    setPasswordError(''); setPasswordSuccess('');
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) { setPasswordError('Ο κωδικός δεν πληροί τις απαιτήσεις.'); return; }
    const { error: passErr } = await supabase.auth.updateUser({ password: newPassword });
    if (passErr) setPasswordError(passErr.message);
    else setPasswordSuccess('Ο κωδικός άλλαξε!');
    setShowPasswordFields(false); setNewPassword('');
  };

  if (loading) return (
    <Container maxWidth="sm" sx={{ pt: { xs: 2, md: 5 }, pb: 4 }}>
      <Paper sx={{ p: 4, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={44} />
        </Stack>
      </Paper>
    </Container>
  );
  if (!user || !profile) return null;

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', py: { xs: 2, md: 5 }, px: 2, pb: { xs: 12, md: 5 } }}>
      <Paper sx={{ width: '100%', maxWidth: 480, p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
        {/* Avatar + header */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: 28, fontWeight: 700, mb: 1.5 }}>
            {(profile.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>Προφίλ</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{user.email}</Typography>
        </Box>

        <Stack spacing={2.5}>
          <TextField label="Όνομα" name="first_name" value={profile.first_name || ''} onChange={handleChange} fullWidth />
          <TextField label="Επώνυμο" name="last_name" value={profile.last_name || ''} onChange={handleChange} fullWidth />
          <TextField label="Email" value={user.email} fullWidth InputProps={{ readOnly: true }} />

          {isUserAdminSync(user, profile) ? (
            <TextField select label="Ρόλος" name="role" value={profile.role || 'student'} onChange={handleChange} fullWidth helperText="Μόνο ο admin μπορεί να αλλάξει τον ρόλο.">
              <MenuItem value="student">Φοιτητής</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          ) : (
            <TextField label="Ρόλος" value={profile.role || 'student'} fullWidth InputProps={{ readOnly: true }} />
          )}

          <Button variant="outlined" fullWidth onClick={() => { setShowPasswordFields(true); setPasswordError(''); setPasswordSuccess(''); setNewPassword(''); }}>
            Αλλαγή κωδικού
          </Button>

          <Dialog open={showPasswordFields} onClose={() => setShowPasswordFields(false)} fullWidth maxWidth="xs">
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Αλλαγή Κωδικού
              <IconButton onClick={() => setShowPasswordFields(false)} size="small" edge="end">
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <DialogContentText sx={{ mb: 3 }}>
                Εισάγετε τον νέο σας κωδικό πρόσβασης παρακάτω.
              </DialogContentText>
              <Stack spacing={2}>
                <TextField
                  label="Νέος κωδικός"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  fullWidth
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(s => !s)} edge="end" size="small">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <PasswordStrengthIndicator password={newPassword} />
                {passwordError && <Alert severity="error">{passwordError}</Alert>}
                {passwordSuccess && <Alert severity="success">{passwordSuccess}</Alert>}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
              <Button onClick={() => setShowPasswordFields(false)} color="inherit">Ακύρωση</Button>
              <Button variant="contained" onClick={handlePasswordChange} disabled={!validatePassword(newPassword).isValid}>
                Αποθήκευση
              </Button>
            </DialogActions>
          </Dialog>

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} fullWidth disabled={saving} sx={{ py: 1.3 }}>
            Αποθήκευση
          </Button>
          <Button variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} fullWidth>
            Αποσύνδεση
          </Button>
        </Stack>

        {/* GDPR Section */}
        <Accordion sx={{ mt: 4, width: '100%' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Δικαιώματα Χρήστη (GDPR)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Μπορείτε να εξάγετε ή να διαγράψετε τα προσωπικά σας δεδομένα ανά πάσα στιγμή.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                fullWidth
                onClick={async () => {
                  const blob = new Blob([JSON.stringify({ user, profile }, null, 2)], { type: 'application/json' });
                  await downloadFile(blob, 'my-profile-data.json');
                }}
              >
                Εξαγωγή δεδομένων
              </Button>
              <Button variant="outlined" color="error" startIcon={<DeleteIcon />} fullWidth onClick={() => setDeleteDialogOpen(true)}>
                Διαγραφή λογαριασμού
              </Button>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle sx={{ color: 'error.main', fontWeight: 800 }}>Οριστική Διαγραφή Λογαριασμού</DialogTitle>
          <DialogContent>
            <DialogContentText>Αυτή η ενέργεια δεν αναιρείται. Όλα τα δεδομένα σας θα διαγραφούν.</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Ακύρωση</Button>
            <Button
              onClick={async () => {
                setDeleting(true);
                await supabase.from('profiles').delete().eq('id', user.id);
                await supabase.auth.signOut();
                setDeleting(false); setDeleteDialogOpen(false); navigate('/');
              }}
              color="error" variant="contained" disabled={deleting}
            >
              Διαγραφή
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Profile;