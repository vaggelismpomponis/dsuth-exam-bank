import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Button, Alert, Skeleton, Select, FormControl, MenuItem,
  useMediaQuery, useTheme, alpha, Avatar, Chip, TextField, InputAdornment,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import CloseIcon from '@mui/icons-material/Close';
import { supabase } from '../../supabaseClient';

const PageHeader = ({ title, subtitle, icon, count }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: '14px',
          background: 'linear-gradient(135deg, #1a73e8 0%, #0052cc 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(26,115,232,0.35)',
        }}>
          {React.cloneElement(icon, { sx: { color: '#fff', fontSize: 22 } })}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2 }}>{subtitle}</Typography>
        </Box>
      </Box>
      {count !== undefined && (
        <Chip
          label={`${count} χρήστες`}
          sx={{
            fontWeight: 700,
            background: isDark ? alpha('#1a73e8', 0.15) : alpha('#1a73e8', 0.1),
            color: 'primary.main',
            border: '1px solid',
            borderColor: alpha('#1a73e8', 0.2),
            borderRadius: '10px',
          }}
        />
      )}
    </Box>
  );
};

const RoleChip = ({ role }) => {
  const isAdmin = role === 'admin';
  return (
    <Chip
      icon={isAdmin ? <AdminPanelSettingsIcon sx={{ fontSize: '14px !important' }} /> : <SchoolIcon sx={{ fontSize: '14px !important' }} />}
      label={isAdmin ? 'Admin' : 'Φοιτητής'}
      size="small"
      sx={{
        fontWeight: 600,
        fontSize: '0.72rem',
        borderRadius: '8px',
        background: isAdmin ? alpha('#7b1fa2', 0.12) : alpha('#1e8e3e', 0.12),
        color: isAdmin ? '#7b1fa2' : '#1e8e3e',
        border: '1px solid',
        borderColor: isAdmin ? alpha('#7b1fa2', 0.2) : alpha('#1e8e3e', 0.2),
        '& .MuiChip-icon': { color: 'inherit' },
      }}
    />
  );
};

const AdminUsers = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [roleSaving, setRoleSaving] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editRole, setEditRole] = useState('student');
  const isMobile = useMediaQuery('(max-width:700px)');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    setUsersLoading(true);
    supabase.from('profiles').select('id,email,first_name,last_name,role').then(({ data, error }) => {
      if (!error) setAllUsers(data || []);
      setUsersLoading(false);
    });
  }, []);

  // Derived state: Sorted and ID'd users
  const preparedUsers = React.useMemo(() => {
    // 1. Sort: Admins first, then Alphabetical
    const sorted = [...allUsers].sort((a, b) => {
      // Admin priority
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (a.role !== 'admin' && b.role === 'admin') return 1;

      // Alphabetical (Last Name -> First Name -> Email)
      const nameA = [a.last_name, a.first_name, a.email].filter(Boolean).join(' ').toLowerCase();
      const nameB = [b.last_name, b.first_name, b.email].filter(Boolean).join(' ').toLowerCase();
      return nameA.localeCompare(nameB, 'el');
    });

    // 2. Assign display IDs (1, 2, 3...) based on sorted position
    return sorted.map((u, index) => ({
      ...u,
      displayId: index + 1
    }));
  }, [allUsers]);

  const handleOpenEdit = (user) => {
    setEditUser(user);
    setEditRole(user.role || 'student');
  };

  const handleRoleSave = async () => {
    if (!editUser) return;
    setRoleSaving(prev => ({ ...prev, [editUser.id]: true }));
    setError(''); setSuccess('');
    const { error } = await supabase.from('profiles').update({ role: editRole }).eq('id', editUser.id);
    if (error) setError('Σφάλμα αλλαγής ρόλου: ' + error.message);
    else {
      setSuccess(`Ο ρόλος του ${editUser.first_name || editUser.email} άλλαξε επιτυχώς!`);
      setAllUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, role: editRole } : u));
    }
    setRoleSaving(prev => ({ ...prev, [editUser.id]: false }));
    setEditUser(null);
  };

  const filtered = preparedUsers.filter(u => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (u.email && u.email.toLowerCase().includes(s)) ||
      (u.first_name && u.first_name.toLowerCase().includes(s)) ||
      (u.last_name && u.last_name.toLowerCase().includes(s))
    );
  });


  const cardStyle = {
    p: { xs: 2, sm: 2.5 },
    borderRadius: '16px',
    background: isDark ? alpha('#fff', 0.04) : '#ffffff',
    border: '1px solid',
    borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)',
    transition: 'all 0.2s ease',
    '&:hover': {
      boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.08)',
    },
  };

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title="Διαχείριση Χρηστών"
        subtitle="Διαχείριση ρόλων και αδειών χρηστών"
        icon={<PeopleAltIcon />}
        count={usersLoading ? undefined : allUsers.length}
      />

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Αναζήτηση χρήστη..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: '12px', background: isDark ? alpha('#fff', 0.05) : '#fff' },
          }}
          sx={{ maxWidth: 380 }}
        />
      </Box>

      {/* Users list */}
      {usersLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...Array(5)].map((_, i) => (
            <Box key={i} sx={cardStyle}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={44} height={44} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="60%" height={16} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton variant="rounded" width={80} height={28} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '10px' }} />
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filtered.length === 0 ? (
            <Box sx={{ ...cardStyle, py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <PeopleAltIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.4 }} />
              <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>Δεν βρέθηκαν χρήστες</Typography>
            </Box>
          ) : (
            filtered.map(u => {
              const initials = `${u.first_name?.[0] || ''}${u.last_name?.[0] || ''}`.toUpperCase() || u.email?.[0]?.toUpperCase() || 'U';
              const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ') || null;
              return (
                <Box key={u.id} sx={cardStyle}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, flexWrap: 'wrap' }}>
                    {/* ID */}
                    <Typography sx={{
                      fontWeight: 800,
                      color: isDark ? alpha('#fff', 0.4) : 'text.secondary',
                      minWidth: 28,
                      fontSize: '0.75rem',
                      fontFamily: 'monospace'
                    }}>
                      {u.displayId}.
                    </Typography>
                    {/* Avatar */}
                    <Avatar
                      sx={{
                        width: 44, height: 44, flexShrink: 0,
                        background: 'linear-gradient(135deg, #1a73e8, #0052cc)',
                        fontSize: '0.875rem', fontWeight: 700,
                        boxShadow: '0 2px 8px rgba(26,115,232,0.25)',
                      }}
                    >
                      {initials}
                    </Avatar>
                    {/* Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      {fullName && (
                        <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3 }}>
                          {fullName}
                        </Typography>
                      )}
                      <Typography sx={{
                        fontSize: '0.8rem', color: fullName ? 'text.secondary' : 'text.primary',
                        fontWeight: fullName ? 400 : 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {u.email}
                      </Typography>
                    </Box>
                    {/* Role chip */}
                    <RoleChip role={u.role} />
                    {/* Edit button */}
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEdit(u)}
                      sx={{
                        width: 36, height: 36, borderRadius: '10px',
                        background: isDark ? alpha('#1a73e8', 0.12) : alpha('#1a73e8', 0.08),
                        color: 'primary.main',
                        '&:hover': { background: isDark ? alpha('#1a73e8', 0.2) : alpha('#1a73e8', 0.14) },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      )}

      {/* Edit Role Dialog */}
      <Dialog
        open={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: isDark ? '#1e1f23' : '#fff',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>Αλλαγή Ρόλου</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {editUser?.first_name || editUser?.email}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setEditUser(null)} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>
            ΕΠΙΛΟΓΗ ΡΟΛΟΥ
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {['student', 'admin'].map((role) => (
              <Box
                key={role}
                onClick={() => setEditRole(role)}
                sx={{
                  flex: 1, py: 2, px: 2, borderRadius: '14px', cursor: 'pointer',
                  border: '2px solid',
                  borderColor: editRole === role ? 'primary.main' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  background: editRole === role ? alpha('#1a73e8', 0.08) : 'transparent',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {role === 'admin'
                  ? <AdminPanelSettingsIcon sx={{ color: editRole === role ? 'primary.main' : 'text.secondary', fontSize: 28 }} />
                  : <SchoolIcon sx={{ color: editRole === role ? 'primary.main' : 'text.secondary', fontSize: 28 }} />
                }
                <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: editRole === role ? 'primary.main' : 'text.secondary' }}>
                  {role === 'admin' ? 'Admin' : 'Φοιτητής'}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setEditUser(null)}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, flex: 1 }}
          >
            Ακύρωση
          </Button>
          <Button
            variant="contained"
            onClick={handleRoleSave}
            disabled={roleSaving[editUser?.id]}
            startIcon={<CheckIcon />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, flex: 1 }}
          >
            Αποθήκευση
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;