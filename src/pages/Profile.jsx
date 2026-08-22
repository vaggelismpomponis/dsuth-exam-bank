import React, { useEffect, useState, useRef } from 'react';
import {
  Container, Typography, Box, Button, TextField, Stack, Alert,
  InputAdornment, IconButton, Skeleton, Paper, Avatar, MenuItem,
  Badge, CircularProgress, Menu as MuiMenu, Switch, FormControlLabel,
  Divider, Chip, useTheme, alpha,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { validatePassword } from '../utils/passwordValidation';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import SaveIcon from '@mui/icons-material/Save';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
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

/* ─── Section label component ─── */
const SectionLabel = ({ icon, label }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
    {icon}
    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', fontSize: '0.7rem' }}>
      {label}
    </Typography>
  </Box>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  useEffect(() => {
    let ignore = false;
    supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) { setError('Σφάλμα κατά τον έλεγχο σύνδεσης.'); setLoading(false); return; }
      if (!data.session) { navigate('/login'); }
      else {
        setUser(data.session.user);
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .maybeSingle();

        if (!ignore) {
          if (profErr) setError('Σφάλμα ανάκτησης προφίλ: ' + profErr.message);
          else if (!prof) setError('Δεν βρέθηκε προφίλ χρήστη. Παρακαλώ επικοινωνήστε με τον διαχειριστή.');
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
    const updateObj = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      show_in_directory: profile.show_in_directory ?? true,
      updated_at: new Date().toISOString()
    };
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
    setShowPasswordDialog(false); setNewPassword('');
  };

  const handleAvatarUpload = async (event) => {
    setAvatarMenuAnchor(null);
    try {
      setUploadingAvatar(true); setError(''); setSuccess('');
      const file = event.target.files[0];
      if (!file) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      let { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { data, error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updateError) throw updateError;
      setUser(data.user);
      setSuccess('Η εικόνα προφίλ ενημερώθηκε!');
    } catch (error) {
      setError('Σφάλμα μεταφόρτωσης: ' + error.message);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarMenuAnchor(null);
    try {
      setUploadingAvatar(true); setError(''); setSuccess('');
      const { data, error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: null } });
      if (updateError) throw updateError;
      setUser(data.user);
      setSuccess('Η εικόνα προφίλ αφαιρέθηκε.');
    } catch (error) {
      setError('Σφάλμα διαγραφής: ' + error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  /* ── Loading skeleton ── */
  if (loading) return (
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      {/* Hero skeleton */}
      <Box sx={{
        background: dark
          ? 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1a1f2c 100%)'
          : 'linear-gradient(135deg, #1a73e8 0%, #1557b0 50%, #0d47a1 100%)',
        pt: { xs: 5, md: 7 }, pb: { xs: 9, md: 11 }, px: 2,
      }}>
        <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <Skeleton variant="circular" width={96} height={96} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
          <Skeleton variant="rounded" width={160} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.12)' }} />
          <Skeleton variant="rounded" width={200} height={18} sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
        </Container>
      </Box>
      <Container maxWidth="sm" sx={{ mt: -4, position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
        <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: '20px' }}>
          <Stack spacing={2.5}>
            {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rounded" height={56} />)}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );

  if (!user || !profile) return null;

  const currentAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || user.email?.split('@')[0];
  const initials = [profile.first_name?.[0], profile.last_name?.[0]].filter(Boolean).join('').toUpperCase() || (user.email?.[0] || 'U').toUpperCase();
  const isAdmin = isUserAdminSync(user, profile);

  return (
    <Box sx={{ minHeight: '100vh', pb: { xs: 14, md: 8 } }}>

      {/* ── Hero Banner ── */}
      <Box sx={{
        position: 'relative',
        overflow: 'hidden',
        background: dark
          ? 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1a1f2c 100%)'
          : 'linear-gradient(135deg, #1a73e8 0%, #1557b0 50%, #0d47a1 100%)',
        pt: { xs: 5, md: 7 },
        pb: { xs: 10, md: 12 },
        px: 2,
        textAlign: 'center',
      }}>
        {/* Decorative blobs */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 280, height: 280, borderRadius: '50%', background: dark ? 'rgba(26,115,232,0.1)' : 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', background: dark ? 'rgba(147,52,230,0.09)' : 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', top: '30%', left: '10%', width: 120, height: 120, borderRadius: '50%', background: dark ? 'rgba(26,115,232,0.06)' : 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Avatar with camera badge */}
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <IconButton
                onClick={(e) => setAvatarMenuAnchor(e.currentTarget)}
                disabled={uploadingAvatar}
                sx={{
                  bgcolor: dark ? 'rgba(26,32,44,0.95)' : '#fff',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                  border: `2px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(26,115,232,0.2)'}`,
                  '&:hover': { bgcolor: dark ? 'rgba(40,50,65,0.95)' : '#f0f4ff' },
                  width: 36, height: 36,
                  transition: 'all 0.2s ease',
                }}
              >
                {uploadingAvatar
                  ? <CircularProgress size={16} />
                  : <CameraAltIcon sx={{ fontSize: 18, color: dark ? 'rgba(255,255,255,0.8)' : 'primary.main' }} />
                }
              </IconButton>
            }
          >
            <Avatar
              src={currentAvatarUrl}
              sx={{
                width: 96, height: 96,
                bgcolor: dark ? 'rgba(26,115,232,0.25)' : 'rgba(255,255,255,0.25)',
                color: '#fff',
                fontSize: 36, fontWeight: 800,
                border: `3px solid ${dark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)'}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {!currentAvatarUrl && initials}
            </Avatar>
          </Badge>

          <MuiMenu
            anchorEl={avatarMenuAnchor}
            open={Boolean(avatarMenuAnchor)}
            onClose={() => setAvatarMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{ sx: { borderRadius: '12px', mt: 0.5, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' } }}
          >
            <MenuItem onClick={() => fileInputRef.current?.click()} sx={{ gap: 1.5, fontSize: '0.9rem' }}>
              <CameraAltIcon fontSize="small" sx={{ color: 'primary.main' }} />
              Μεταφόρτωση νέας εικόνας
            </MenuItem>
            {currentAvatarUrl && (
              <MenuItem onClick={handleAvatarRemove} sx={{ color: 'error.main', gap: 1.5, fontSize: '0.9rem' }}>
                <DeleteIcon fontSize="small" />
                Αφαίρεση εικόνας
              </MenuItem>
            )}
          </MuiMenu>
          <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleAvatarUpload} />

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', mt: 2, letterSpacing: '-0.02em' }}>
            {displayName}
          </Typography>
          <Typography sx={{ color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.78)', fontSize: '0.9rem', mt: 0.5 }}>
            {user.email}
          </Typography>

          {/* Role chip */}
          <Chip
            icon={isAdmin
              ? <AdminPanelSettingsOutlinedIcon sx={{ fontSize: '14px !important', color: 'rgba(255,255,255,0.85) !important' }} />
              : <PersonOutlinedIcon sx={{ fontSize: '14px !important', color: 'rgba(255,255,255,0.85) !important' }} />
            }
            label={isAdmin ? 'Admin' : 'Φοιτητής'}
            size="small"
            sx={{
              mt: 1.5,
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.18)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(8px)',
              '& .MuiChip-icon': { color: 'rgba(255,255,255,0.85)' },
            }}
          />
        </Container>
      </Box>

      {/* ── Main Card (overlapping hero) ── */}
      <Container maxWidth="sm" sx={{ mt: -5, position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: '20px',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(26,115,232,0.1)'}`,
            overflow: 'hidden',
            boxShadow: dark
              ? '0 24px 64px rgba(0,0,0,0.45)'
              : '0 24px 64px rgba(26,115,232,0.12)',
          }}
        >
          {/* ── Personal Info Section ── */}
          <Box sx={{ p: { xs: 3, sm: 4 }, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.05s' }}>
            <SectionLabel
              icon={<PersonOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
              label="Προσωπικά Στοιχεία"
            />
            <Stack spacing={2.5}>
              <TextField
                label="Όνομα"
                name="first_name"
                value={profile.first_name || ''}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Επώνυμο"
                name="last_name"
                value={profile.last_name || ''}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlinedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Email"
                value={user.email}
                fullWidth
                InputProps={{
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                  '& .MuiOutlinedInput-input': { color: 'text.secondary' },
                }}
              />

              {isAdmin ? (
                <TextField
                  select
                  label="Ρόλος"
                  name="role"
                  value={profile.role || 'student'}
                  onChange={handleChange}
                  fullWidth
                  helperText="Μόνο ο admin μπορεί να αλλάξει τον ρόλο."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                >
                  <MenuItem value="student">Φοιτητής</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </TextField>
              ) : (
                <TextField
                  label="Ρόλος"
                  value={profile.role === 'admin' ? 'Admin' : 'Φοιτητής'}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: '12px' },
                    '& .MuiOutlinedInput-input': { color: 'text.secondary' },
                  }}
                />
              )}
            </Stack>

            {error && <Alert severity="error" sx={{ mt: 2.5, borderRadius: '12px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2.5, borderRadius: '12px' }}>{success}</Alert>}
          </Box>

          <Divider />

          {/* ── Security Section ── */}
          <Box sx={{ p: { xs: 3, sm: 4 }, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.12s' }}>
            <SectionLabel
              icon={<LockOutlinedIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
              label="Ασφάλεια"
            />
            <Button
              variant="outlined"
              startIcon={<LockOutlinedIcon />}
              fullWidth
              onClick={() => { setShowPasswordDialog(true); setPasswordError(''); setPasswordSuccess(''); setNewPassword(''); }}
              sx={{
                borderRadius: '12px',
                py: 1.3,
                fontWeight: 600,
                borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(26,115,232,0.3)',
                '&:hover': {
                  borderColor: 'primary.main',
                  background: alpha('#1a73e8', 0.06),
                },
              }}
            >
              Αλλαγή Κωδικού Πρόσβασης
            </Button>
            {passwordSuccess && <Alert severity="success" sx={{ mt: 1.5, borderRadius: '12px' }}>{passwordSuccess}</Alert>}
          </Box>

          <Divider />

          {/* ── Action Buttons ── */}
          <Box sx={{ p: { xs: 3, sm: 4 }, animation: 'fadeInUp 0.5s ease both', animationDelay: '0.18s' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <SaveIcon />}
                onClick={handleSave}
                fullWidth
                disabled={saving}
                sx={{
                  py: 1.4,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 16px rgba(26,115,232,0.3)',
                  '&:hover': { boxShadow: '0 6px 20px rgba(26,115,232,0.4)' },
                }}
              >
                {saving ? 'Αποθήκευση...' : 'Αποθήκευση'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<LogoutIcon />}
                onClick={async () => {
                  try { await supabase.auth.signOut(); } catch (err) { console.warn(err); }
                  Object.keys(localStorage).forEach((key) => {
                    if (key.startsWith('sb-') && key.endsWith('-auth-token')) localStorage.removeItem(key);
                  });
                  navigate('/');
                  window.location.reload();
                }}
                fullWidth
                sx={{
                  py: 1.4,
                  borderRadius: '12px',
                  fontWeight: 600,
                  color: 'error.main',
                  borderColor: dark ? 'rgba(244,67,54,0.3)' : 'rgba(244,67,54,0.3)',
                  '&:hover': {
                    borderColor: 'error.main',
                    background: alpha('#f44336', 0.06),
                  },
                }}
              >
                Αποσύνδεση
              </Button>
            </Stack>
          </Box>

          {/* ── GDPR Accordion ── */}
          <Accordion
            disableGutters
            elevation={0}
            sx={{
              borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
              '&::before': { display: 'none' },
              borderRadius: '0 0 20px 20px',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: { xs: 3, sm: 4 }, py: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: '8px',
                  background: dark ? alpha('#1a73e8', 0.15) : alpha('#1a73e8', 0.08),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <GppGoodOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  Δικαιώματα Χρήστη (GDPR)
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: { xs: 3, sm: 4 }, pb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.7 }}>
                Μπορείτε να εξάγετε ή να διαγράψετε τα προσωπικά σας δεδομένα ανά πάσα στιγμή.
              </Typography>

              <Box sx={{
                p: 2,
                borderRadius: '12px',
                background: dark ? alpha('#1a73e8', 0.06) : alpha('#1a73e8', 0.04),
                border: `1px solid ${dark ? alpha('#1a73e8', 0.12) : alpha('#1a73e8', 0.1)}`,
                mb: 2.5,
              }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.show_in_directory ?? true}
                      onChange={(e) => setProfile({ ...profile, show_in_directory: e.target.checked })}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Εμφάνιση στον Κατάλογο Φοιτητών
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Επιτρέψτε σε άλλους φοιτητές να σας βρουν
                      </Typography>
                    </Box>
                  }
                  sx={{ m: 0, alignItems: 'center' }}
                />
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  fullWidth
                  onClick={async () => {
                    const blob = new Blob([JSON.stringify({ user, profile }, null, 2)], { type: 'application/json' });
                    await downloadFile(blob, 'my-profile-data.json');
                  }}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 600,
                    py: 1.2,
                    borderColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(26,115,232,0.3)',
                    '&:hover': { borderColor: 'primary.main', background: alpha('#1a73e8', 0.06) },
                  }}
                >
                  Εξαγωγή δεδομένων
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  fullWidth
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 600,
                    py: 1.2,
                    borderColor: 'rgba(244,67,54,0.3)',
                    '&:hover': { borderColor: 'error.main', background: alpha('#f44336', 0.06) },
                  }}
                >
                  Διαγραφή λογαριασμού
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Paper>
      </Container>

      {/* ── Change Password Dialog ── */}
      <Dialog open={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} fullWidth maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 0.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: alpha('#1a73e8', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LockOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            </Box>
            Αλλαγή Κωδικού
          </Box>
          <IconButton onClick={() => setShowPasswordDialog(false)} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2.5, fontSize: '0.9rem' }}>
            Εισάγετε τον νέο σας κωδικό πρόσβασης παρακάτω.
          </DialogContentText>
          <Stack spacing={2}>
            <TextField
              label="Νέος κωδικός"
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
            {passwordError && <Alert severity="error" sx={{ borderRadius: '12px' }}>{passwordError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
          <Button onClick={() => setShowPasswordDialog(false)} color="inherit" sx={{ borderRadius: '10px' }}>Ακύρωση</Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={!validatePassword(newPassword).isValid}
            sx={{ borderRadius: '10px', fontWeight: 700 }}
          >
            Αποθήκευση
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Account Dialog ── */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '20px', p: 0.5 } }}
      >
        <DialogTitle sx={{ color: 'error.main', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', background: alpha('#f44336', 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DeleteIcon sx={{ fontSize: 20, color: 'error.main' }} />
          </Box>
          Οριστική Διαγραφή Λογαριασμού
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
            Αυτή η ενέργεια <strong>δεν αναιρείται</strong>. Όλα τα δεδομένα σας θα διαγραφούν οριστικά.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ borderRadius: '10px' }}>Ακύρωση</Button>
          <Button
            onClick={async () => {
              setDeleting(true);
              try { await supabase.from('profiles').delete().eq('id', user.id); } catch (err) { console.warn(err); }
              try { await supabase.auth.signOut(); } catch (err) { console.warn(err); }
              Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('sb-') && key.endsWith('-auth-token')) localStorage.removeItem(key);
              });
              setDeleting(false); setDeleteDialogOpen(false);
              navigate('/');
              window.location.reload();
            }}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{
              borderRadius: '10px', fontWeight: 700,
              boxShadow: '0 4px 12px rgba(244,67,54,0.3)',
            }}
          >
            {deleting ? <CircularProgress size={18} sx={{ color: 'inherit' }} /> : 'Διαγραφή'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;