import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, IconButton, Chip, Alert, Skeleton, Stack,
  Avatar, useTheme, alpha, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import AssignmentIndIcon      from '@mui/icons-material/AssignmentInd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon     from '@mui/icons-material/CancelOutlined';
import DeleteOutlineIcon      from '@mui/icons-material/DeleteOutline';
import EmailOutlinedIcon      from '@mui/icons-material/EmailOutlined';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import MessageIcon            from '@mui/icons-material/Message';
import RefreshIcon            from '@mui/icons-material/Refresh';
import CloseIcon              from '@mui/icons-material/Close';
import { supabase } from '../../supabaseClient';

const AdminApplications = () => {
  const theme = useTheme();
  const dark  = theme.palette.mode === 'dark';

  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert,   setAlert]   = useState({ type: '', msg: '' });
  const [actionModal, setActionModal] = useState({ open: false, type: null, id: null, userId: null });

  const notify = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('admin_applications')
      .select('id,user_id,email,name,message,status,created_at')
      .order('created_at', { ascending: false });
    if (error) notify('error', error.message);
    else setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const confirmAction = async () => {
    const { type, id, userId } = actionModal;
    setActionModal({ open: false, type: null, id: null, userId: null });
    if (!id) return;

    if (type === 'approve') {
      const [a, b] = await Promise.all([
        supabase.from('admin_applications').update({ status: 'approved' }).eq('id', id),
        supabase.from('profiles').update({ role: 'admin' }).eq('id', userId),
      ]);
      if (a.error || b.error) { notify('error', (a.error ?? b.error).message); return; }
      notify('success', 'Εγκρίθηκε! Ο χρήστης έγινε Admin.');
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    } else if (type === 'reject') {
      const { error } = await supabase.from('admin_applications').update({ status: 'rejected' }).eq('id', id);
      if (error) { notify('error', error.message); return; }
      notify('success', 'Η αίτηση απορρίφθηκε.');
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    } else if (type === 'delete') {
      const { error } = await supabase.from('admin_applications').delete().eq('id', id);
      if (error) { notify('error', error.message); return; }
      notify('success', 'Η αίτηση διαγράφηκε!');
      setRows(prev => prev.filter(r => r.id !== id));
    }
  };

  const statusChip = (status) => {
    const map = {
      approved: { label: 'Εγκρίθηκε',   color: '#1e8e3e' },
      rejected: { label: 'Απορρίφθηκε', color: '#d32f2f' },
      pending:  { label: 'Εκκρεμεί',    color: '#f57c00' },
    };
    const { label, color } = map[status] ?? map.pending;
    return (
      <Chip label={label} size="small" sx={{
        fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px', flexShrink: 0,
        background: alpha(color, 0.12), color,
        border: '1px solid', borderColor: alpha(color, 0.22),
      }} />
    );
  };

  const cb = {
    background: dark ? alpha('#fff', 0.04) : '#fff',
    border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    borderRadius: '16px',
    boxShadow: dark ? 'none' : '0 2px 10px rgba(0,0,0,.04)',
    transition: 'box-shadow .2s',
    '&:hover': { boxShadow: dark ? '0 4px 20px rgba(0,0,0,.28)' : '0 6px 22px rgba(0,0,0,.08)' },
  };

  const pendingCount = rows.filter(r => r.status === 'pending').length;

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
            <AssignmentIndIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: '1.35rem', sm: '1.7rem' } }}>
              Αιτήσεις Admin
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2, fontSize: '0.82rem' }}>
              Αιτήσεις χρηστών για δικαιώματα διαχειριστή
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!loading && pendingCount > 0 && (
            <Chip label={`${pendingCount} εκκρεμείς`} size="small" sx={{
              fontWeight: 700, fontSize: '0.72rem', borderRadius: '8px',
              background: alpha('#f57c00', 0.12), color: '#f57c00',
              border: '1px solid', borderColor: alpha('#f57c00', 0.22),
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

      {loading ? (
        <Stack spacing={2}>
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ ...cb, p: 2.75 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Skeleton variant="circular" width={44} height={44} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="42%" height={20} />
                  <Skeleton width="60%" height={15} sx={{ mt: 0.5 }} />
                </Box>
                <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: '8px' }} />
              </Box>
              <Skeleton width="100%" height={75} sx={{ borderRadius: '11px' }} />
            </Box>
          ))}
        </Stack>
      ) : rows.length === 0 ? (
        <Box sx={{ ...cb, py: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <AssignmentIndIcon sx={{ fontSize: 52, color: 'text.secondary', opacity: 0.25 }} />
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>Δεν υπάρχουν αιτήσεις</Typography>
        </Box>
      ) : (
        <Stack spacing={1.75}>
          {rows.map(r => (
            <Box key={r.id} sx={cb}>
              <Box sx={{ p: { xs: 2, sm: 2.75 } }}>
                {/* User row */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                    <Avatar sx={{
                      width: 44, height: 44, flexShrink: 0,
                      background: 'linear-gradient(135deg,#1a73e8,#0052cc)',
                      fontSize: '0.9rem', fontWeight: 700,
                      boxShadow: '0 2px 8px rgba(26,115,232,.22)',
                    }}>
                      {r.name?.[0]?.toUpperCase() ?? 'U'}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.25 }}>
                        {r.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.4, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailOutlinedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{r.email}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                            {new Date(r.created_at).toLocaleDateString('el-GR')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                  {statusChip(r.status)}
                </Box>

                {/* Message */}
                <Box sx={{
                  p: 1.75, borderRadius: '11px', mb: 2.5,
                  background: dark ? alpha('#fff', 0.03) : alpha('#000', 0.025),
                  border: '1px solid',
                  borderColor: dark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
                }}>
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.75 }}>
                    Λόγος Αίτησης
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'flex-start' }}>
                    <MessageIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.15, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.875rem', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {r.message || <Box component="span" sx={{ fontStyle: 'italic', opacity: 0.45 }}>Δεν αναφέρθηκε λόγος.</Box>}
                    </Typography>
                  </Box>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {r.status === 'pending' && (
                    <>
                      <Button
                        size="small" variant="contained" color="success"
                        onClick={() => setActionModal({ open: true, type: 'approve', id: r.id, userId: r.user_id })}
                        startIcon={<CheckCircleOutlineIcon />}
                        sx={{ borderRadius: '9px', textTransform: 'none', fontWeight: 700, px: 2 }}
                      >
                        Έγκριση
                      </Button>
                      <Button
                        size="small"
                        onClick={() => setActionModal({ open: true, type: 'reject', id: r.id })}
                        startIcon={<CancelOutlinedIcon />}
                        sx={{
                          borderRadius: '9px', textTransform: 'none', fontWeight: 700, px: 2,
                          background: alpha('#f57c00', 0.1), color: '#f57c00',
                          '&:hover': { background: alpha('#f57c00', 0.18) },
                        }}
                      >
                        Απόρριψη
                      </Button>
                    </>
                  )}
                  <Button
                    size="small"
                    onClick={() => setActionModal({ open: true, type: 'delete', id: r.id })}
                    startIcon={<DeleteOutlineIcon />}
                    sx={{
                      borderRadius: '9px', textTransform: 'none', fontWeight: 700, px: 2,
                      background: alpha('#d32f2f', 0.08), color: '#d32f2f',
                      '&:hover': { background: alpha('#d32f2f', 0.16) },
                    }}
                  >
                    Διαγραφή
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      )}

      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionModal.open}
        onClose={() => setActionModal({ open: false, type: null, id: null, userId: null })}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', background: dark ? '#1e1f23' : '#fff', border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' } }}
      >
        <DialogTitle sx={{ pt: 2.5, px: 3, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>
            {actionModal.type === 'approve' ? 'Επιβεβαίωση Έγκρισης' : actionModal.type === 'reject' ? 'Επιβεβαίωση Απόρριψης' : 'Επιβεβαίωση Διαγραφής'}
          </Typography>
          <IconButton size="small" onClick={() => setActionModal({ open: false, type: null, id: null, userId: null })} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {actionModal.type === 'approve' && 'Ο χρήστης θα αποκτήσει δικαιώματα Admin. Είσαι σίγουρος;'}
            {actionModal.type === 'reject' && 'Σίγουρα θέλεις να απορρίψεις αυτή την αίτηση;'}
            {actionModal.type === 'delete' && 'Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτή την αίτηση; Η ενέργεια δεν μπορεί να αναιρεθεί.'}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button onClick={() => setActionModal({ open: false, type: null, id: null, userId: null })} sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
            Ακύρωση
          </Button>
          <Button
            variant="contained"
            color={actionModal.type === 'approve' ? 'success' : actionModal.type === 'reject' ? 'warning' : 'error'}
            onClick={confirmAction}
            startIcon={actionModal.type === 'approve' ? <CheckCircleOutlineIcon /> : actionModal.type === 'reject' ? <CancelOutlinedIcon /> : <DeleteOutlineIcon />}
            sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            {actionModal.type === 'approve' ? 'Έγκριση' : actionModal.type === 'reject' ? 'Απόρριψη' : 'Διαγραφή'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminApplications;
