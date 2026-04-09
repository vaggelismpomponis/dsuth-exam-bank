import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, IconButton, Chip, Button,
  Alert, Skeleton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Avatar, useTheme, alpha,
} from '@mui/material';
import SearchIcon             from '@mui/icons-material/Search';
import PeopleAltIcon          from '@mui/icons-material/PeopleAlt';
import EditIcon               from '@mui/icons-material/Edit';
import CloseIcon              from '@mui/icons-material/Close';
import CheckIcon              from '@mui/icons-material/Check';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon             from '@mui/icons-material/School';
import RefreshIcon            from '@mui/icons-material/Refresh';
import { supabase } from '../../supabaseClient';

/* ─── Helpers ─── */
const cardBase = (dark) => ({
  background: dark ? alpha('#fff', 0.04) : '#fff',
  border: '1px solid',
  borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
  borderRadius: '14px',
  boxShadow: dark ? 'none' : '0 2px 10px rgba(0,0,0,.04)',
});

const RoleChip = ({ role }) => {
  const isAdmin = role === 'admin';
  const color   = isAdmin ? '#7b1fa2' : '#1e8e3e';
  return (
    <Chip
      icon={isAdmin
        ? <AdminPanelSettingsIcon sx={{ fontSize: '13px !important' }} />
        : <SchoolIcon             sx={{ fontSize: '13px !important' }} />}
      label={isAdmin ? 'Admin' : 'Φοιτητής'}
      size="small"
      sx={{
        fontWeight: 700, fontSize: { xs: '0.65rem', sm: '0.7rem' }, borderRadius: '8px',
        background: alpha(color, 0.12),
        color,
        border: '1px solid', borderColor: alpha(color, 0.22),
        '& .MuiChip-icon': { color: 'inherit', ml: 0.75 },
        flexShrink: 0,
        height: { xs: 22, sm: 24 },
        '& .MuiChip-label': { px: { xs: 0.75, sm: 1 } }
      }}
    />
  );
};

/* ─── Main ─── */
const AdminUsers = () => {
  const theme = useTheme();
  const dark  = theme.palette.mode === 'dark';

  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [alert,    setAlert]    = useState({ type: '', msg: '' });
  const [saving,   setSaving]   = useState(false);
  const [editUser, setEditUser] = useState(null);   // { id, email, first_name, role, … }
  const [editRole, setEditRole] = useState('student');

  const notify = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id,email,first_name,last_name,role');
    if (error) {
      console.error('AdminUsers fetch error:', error);
      notify('error', 'Σφάλμα φόρτωσης χρηστών: ' + error.message);
    }
    setUsers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (u) => { setEditUser(u); setEditRole(u.role || 'student'); };

  const saveRole = async () => {
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ role: editRole }).eq('id', editUser.id);
    if (error) notify('error', 'Σφάλμα: ' + error.message);
    else {
      notify('success', 'Ο ρόλος αλλάχτηκε επιτυχώς!');
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, role: editRole } : u));
      setEditUser(null);
    }
    setSaving(false);
  };

  const filtered = users
    .filter(u => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (u.email ?? '').toLowerCase().includes(s)
        || (u.first_name ?? '').toLowerCase().includes(s)
        || (u.last_name  ?? '').toLowerCase().includes(s);
    })
    .sort((a, b) => {
      // Admins first
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (b.role === 'admin' && a.role !== 'admin') return  1;
      // Then alphabetically by display name (fall back to email)
      const nameA = [a.first_name, a.last_name].filter(Boolean).join(' ') || a.email || '';
      const nameB = [b.first_name, b.last_name].filter(Boolean).join(' ') || b.email || '';
      return nameA.localeCompare(nameB, 'el');
    });

  const cb = cardBase(dark);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '13px',
            background: 'linear-gradient(135deg,#1a73e8,#0052cc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(26,115,232,.35)',
          }}>
            <PeopleAltIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: '1.35rem', sm: '1.7rem' } }}>
              Διαχείριση Χρηστών
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2, fontSize: '0.82rem' }}>
              Διαχείριση ρόλων και δικαιωμάτων χρηστών
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!loading && (
            <Chip label={`${users.length} χρήστες`} size="small" sx={{
              fontWeight: 700, fontSize: '0.75rem', borderRadius: '9px',
              background: dark ? alpha('#1a73e8', 0.15) : alpha('#1a73e8', 0.1),
              color: 'primary.main', border: '1px solid', borderColor: alpha('#1a73e8', 0.2),
            }} />
          )}
          <Tooltip title="Ανανέωση" disableInteractive>
            <IconButton size="small" onClick={load} sx={{ borderRadius: '9px' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {alert.msg && (
        <Alert severity={alert.type} sx={{ mb: 2.5, borderRadius: '12px' }} onClose={() => setAlert({ type: '', msg: '' })}>
          {alert.msg}
        </Alert>
      )}

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Αναζήτηση χρήστη..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: 'text.secondary' }} /></InputAdornment>,
            sx: { borderRadius: '11px', background: dark ? alpha('#fff', 0.05) : '#fff', fontSize: '0.875rem' },
          }}
          sx={{ maxWidth: 340 }}
        />
      </Box>

      {/* User list */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[...Array(6)].map((_, i) => (
            <Box key={i} sx={{ ...cb, p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Skeleton variant="circular" width={42} height={42} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="38%" height={18} />
                  <Skeleton width="56%" height={14} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton variant="rounded" width={75} height={24} sx={{ borderRadius: '8px' }} />
                <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '9px' }} />
              </Box>
            </Box>
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ ...cb, py: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <PeopleAltIcon sx={{ fontSize: 52, color: 'text.secondary', opacity: 0.25 }} />
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>Δεν βρέθηκαν χρήστες</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {filtered.map((u, idx) => {
            const initials = `${u.first_name?.[0] ?? ''}${u.last_name?.[0] ?? ''}`.toUpperCase() || u.email?.[0]?.toUpperCase() || 'U';
            const name     = [u.first_name, u.last_name].filter(Boolean).join(' ');
            return (
              <Box key={u.id} sx={{
                ...cb, px: { xs: 1.5, sm: 2.5 }, py: { xs: 1.25, sm: 1.75 },
                display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: { xs: 'wrap', sm: 'nowrap' },
                transition: 'box-shadow .2s',
                '&:hover': { boxShadow: dark ? '0 4px 20px rgba(0,0,0,.28)' : '0 4px 18px rgba(0,0,0,.08)' },
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flex: { xs: '1 1 100%', sm: 1 }, minWidth: 0 }}>
                  {/* Number */}
                  <Typography sx={{
                    fontSize: { xs: '0.65rem', sm: '0.72rem' }, fontWeight: 700, color: 'text.secondary',
                    minWidth: { xs: 16, sm: 24 }, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums',
                  }}>
                    {idx + 1}.
                  </Typography>

                  <Avatar sx={{
                    width: { xs: 34, sm: 42 }, height: { xs: 34, sm: 42 }, flexShrink: 0,
                    background: u.role === 'admin'
                      ? 'linear-gradient(135deg,#7b1fa2,#4a148c)'
                      : 'linear-gradient(135deg,#1a73e8,#0052cc)',
                    fontSize: '0.85rem', fontWeight: 700,
                    boxShadow: u.role === 'admin'
                      ? '0 2px 8px rgba(123,31,162,.28)'
                      : '0 2px 8px rgba(26,115,232,.22)',
                  }}>
                    {initials}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {name && (
                      <Typography sx={{ 
                        fontWeight: 700, fontSize: { xs: '0.8rem', sm: '0.875rem' }, lineHeight: 1.3, 
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                      }}>
                        {name}
                      </Typography>
                    )}
                    <Typography sx={{
                      fontSize: { xs: '0.75rem', sm: '0.8rem' },
                      color: name ? 'text.secondary' : 'text.primary',
                      fontWeight: name ? 400 : 600,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {u.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: { xs: '32px', sm: 0 }, mt: { xs: 0.5, sm: 0 } }}>
                  <RoleChip role={u.role} />

                  <Tooltip title="Αλλαγή ρόλου" disableInteractive>
                    <IconButton
                      size="small"
                      onClick={() => openEdit(u)}
                      sx={{
                        width: 32, height: 32, borderRadius: '9px',
                        background: dark ? alpha('#1a73e8', 0.13) : alpha('#1a73e8', 0.08),
                        color: 'primary.main',
                        '&:hover': { background: dark ? alpha('#1a73e8', 0.22) : alpha('#1a73e8', 0.14) },
                      }}
                    >
                      <EditIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Edit Role Dialog */}
      <Dialog
        open={Boolean(editUser)}
        onClose={() => setEditUser(null)}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', background: dark ? '#1e1f23' : '#fff', border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' } }}
      >
        <DialogTitle sx={{ pt: 2.5, px: 3, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>Αλλαγή Ρόλου</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              {editUser?.first_name ? `${editUser.first_name} ${editUser.last_name ?? ''}`.trim() : editUser?.email}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setEditUser(null)} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
            {['student', 'admin'].map(role => {
              const active = editRole === role;
              const color  = role === 'admin' ? '#7b1fa2' : '#1e8e3e';
              const Icon   = role === 'admin' ? AdminPanelSettingsIcon : SchoolIcon;
              return (
                <Box
                  key={role}
                  onClick={() => setEditRole(role)}
                  sx={{
                    flex: 1, py: 2.5, borderRadius: '14px', cursor: 'pointer',
                    border: '2px solid',
                    borderColor: active ? color : dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    background:  active ? alpha(color, 0.1) : 'transparent',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                    transition: 'all .2s',
                  }}
                >
                  <Icon sx={{ fontSize: 30, color: active ? color : 'text.secondary' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: active ? color : 'text.secondary' }}>
                    {role === 'admin' ? 'Admin' : 'Φοιτητής'}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button onClick={() => setEditUser(null)} sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
            Ακύρωση
          </Button>
          <Button
            variant="contained" onClick={saveRole} disabled={saving}
            startIcon={<CheckIcon />}
            sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            Αποθήκευση
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUsers;