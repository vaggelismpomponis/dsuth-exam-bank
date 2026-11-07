import React, { useEffect, useState, useRef } from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { isUserAdminSync } from '../utils/adminUtils';
import { downloadFile } from '../utils/nativeDownload';
import { validatePassword } from '../utils/passwordValidation';
import { getFriendlyErrorMessage } from '../utils/errorUtils';
import { ProfileHero } from '../components/profile/ProfileHero';
import { PersonalInfoCard } from '../components/profile/PersonalInfoCard';
import { OtherSettingsCard } from '../components/profile/OtherSettingsCard';
import { SpendlorePromoCard } from '../components/profile/SpendlorePromoCard';
import { ChangePasswordDialog } from '../components/profile/ChangePasswordDialog';
import { DeleteAccountDialog } from '../components/profile/DeleteAccountDialog';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    supabase.auth.getSession().then(async ({ data, error: sessionErr }) => {
      if (sessionErr) { setError('Σφάλμα κατά τον έλεγχο σύνδεσης.'); setLoading(false); return; }
      if (!data.session) { navigate('/login'); }
      else {
        setUser(data.session.user);
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .maybeSingle();

        if (!ignore) {
          if (profErr) setError(getFriendlyErrorMessage(profErr, 'Σφάλμα ανάκτησης στοιχείων προφίλ.'));
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
      updated_at: new Date().toISOString(),
    };
    if (isUserAdminSync(user, profile)) updateObj.role = profile.role;
    const { error: updateErr } = await supabase.from('profiles').update(updateObj).eq('id', user.id);
    if (updateErr) setError(getFriendlyErrorMessage(updateErr, 'Σφάλμα κατά την αποθήκευση των στοιχείων.'));
    else setSuccess('Τα στοιχεία αποθηκεύτηκαν επιτυχώς!');
    setSaving(false);
  };

  const handlePasswordSubmit = async (newPassword) => {
    setPasswordError(''); setPasswordSuccess('');
    const validation = validatePassword(newPassword);
    if (!validation.isValid) { setPasswordError('Ο κωδικός δεν πληροί τις απαιτήσεις.'); return; }
    const { error: passErr } = await supabase.auth.updateUser({ password: newPassword });
    if (passErr) {
      setPasswordError(getFriendlyErrorMessage(passErr, 'Σφάλμα κατά την αλλαγή κωδικού πρόσβασης.'));
    } else {
      setPasswordSuccess('Ο κωδικός πρόσβασης ενημερώθηκε επιτυχώς!');
      setShowPasswordDialog(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    setAvatarMenuAnchor(null);
    try {
      setUploadingAvatar(true); setError(''); setSuccess('');
      const file = event.target.files[0];
      if (!file) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { data, error: updateError } = await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updateError) throw updateError;
      setUser(data.user);
      setSuccess('Η εικόνα προφίλ ενημερώθηκε επιτυχώς!');
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Σφάλμα μεταφόρτωσης εικόνας προφίλ.'));
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
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Σφάλμα διαγραφής εικόνας προφίλ.'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleExportData = async () => {
    const blob = new Blob([JSON.stringify({ user, profile }, null, 2)], { type: 'application/json' });
    await downloadFile(blob, 'my-profile-data.json');
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try { await supabase.from('profiles').delete().eq('id', user.id); } catch (err) { console.warn(err); }
    try { await supabase.auth.signOut(); } catch (err) { console.warn(err); }
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) localStorage.removeItem(key);
    });
    setDeleting(false);
    setDeleteDialogOpen(false);
    navigate('/');
    window.location.reload();
  };

  const handleLogout = async () => {
    try { await supabase.auth.signOut(); } catch (err) { console.warn(err); }
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) localStorage.removeItem(key);
    });
    navigate('/');
    window.location.reload();
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100dvh', pb: 8 }}>
        <Box sx={{ bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider', pt: 5, pb: 5, textAlign: 'center' }}>
          <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <Skeleton variant="circular" width={88} height={88} />
            <Skeleton variant="text" width={180} height={28} />
            <Skeleton variant="text" width={220} height={18} />
          </Container>
        </Box>
        <Container maxWidth="lg" sx={{ mt: 4, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }} elevation={0}>
              <Stack spacing={2}>
                {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: '8px' }} />)}
              </Stack>
            </Paper>
            <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }} elevation={0}>
              <Stack spacing={2}>
                {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rounded" height={52} sx={{ borderRadius: '8px' }} />)}
              </Stack>
            </Paper>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!user || !profile) return null;

  const currentAvatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || user.email?.split('@')[0];
  const initials = [profile.first_name?.[0], profile.last_name?.[0]].filter(Boolean).join('').toUpperCase() || (user.email?.[0] || 'U').toUpperCase();
  const isAdmin = isUserAdminSync(user, profile);

  return (
    <Box sx={{ minHeight: '100dvh', pb: { xs: 14, md: 8 } }}>
      <ProfileHero
        user={user}
        displayName={displayName}
        initials={initials}
        currentAvatarUrl={currentAvatarUrl}
        isAdmin={isAdmin}
        uploadingAvatar={uploadingAvatar}
        avatarMenuAnchor={avatarMenuAnchor}
        setAvatarMenuAnchor={setAvatarMenuAnchor}
        fileInputRef={fileInputRef}
        handleAvatarUpload={handleAvatarUpload}
        handleAvatarRemove={handleAvatarRemove}
      />

      <Container maxWidth="lg" sx={{ mt: 4, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 3, md: 3.5 },
            alignItems: 'stretch',
          }}
        >
          <PersonalInfoCard
            profile={profile}
            user={user}
            isAdmin={isAdmin}
            saving={saving}
            error={error}
            success={success}
            onChange={handleChange}
            onSave={handleSave}
          />

          <OtherSettingsCard
            passwordSuccess={passwordSuccess}
            onOpenPasswordDialog={() => {
              setShowPasswordDialog(true);
              setPasswordError('');
            }}
            onExportData={handleExportData}
            onOpenDeleteDialog={() => setDeleteDialogOpen(true)}
            onLogout={handleLogout}
          />
        </Box>

        <Box sx={{ mt: { xs: 3, md: 3.5 } }}>
          <SpendlorePromoCard />
        </Box>
      </Container>

      <ChangePasswordDialog
        open={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onSubmit={handlePasswordSubmit}
        error={passwordError}
      />

      <DeleteAccountDialog
        open={deleteDialogOpen}
        deleting={deleting}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </Box>
  );
};

export default Profile;
