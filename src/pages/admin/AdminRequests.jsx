import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Button, IconButton, Chip, Alert, Skeleton, Stack,
  useTheme, alpha, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import HelpOutlineIcon        from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReplayIcon             from '@mui/icons-material/Replay';
import DeleteOutlineIcon      from '@mui/icons-material/DeleteOutline';
import CalendarTodayIcon      from '@mui/icons-material/CalendarToday';
import AccessTimeIcon         from '@mui/icons-material/AccessTime';
import MessageIcon            from '@mui/icons-material/Message';
import RefreshIcon            from '@mui/icons-material/Refresh';
import CloseIcon              from '@mui/icons-material/Close';
import { supabase } from '../../supabaseClient';

const AdminRequests = () => {
  const theme = useTheme();
  const dark  = theme.palette.mode === 'dark';

  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert,   setAlert]   = useState({ type: '', msg: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  const notify = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('file_requests')
      .select('id,course,year,period,details,status,created_at')
      .order('created_at', { ascending: false });
    if (error) notify('error', error.message);
    else setRows(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (id, current) => {
    const next = current === 'open' ? 'closed' : 'open';
    const { error } = await supabase.from('file_requests').update({ status: next }).eq('id', id);
    if (error) notify('error', error.message);
    else {
      notify('success', 'Η κατάσταση ενημερώθηκε!');
      setRows(prev => prev.map(r => r.id === id ? { ...r, status: next } : r));
    }
  };

  const confirmDelete = async () => {
    const { id } = deleteModal;
    setDeleteModal({ open: false, id: null });
    if (!id) return;
    const { error } = await supabase.from('file_requests').delete().eq('id', id);
    if (error) notify('error', error.message);
    else {
      notify('success', 'Το αίτημα διαγράφηκε!');
      setRows(prev => prev.filter(r => r.id !== id));
    }
  };

  const cb = {
    background: dark ? alpha('#fff', 0.04) : '#fff',
    border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    borderRadius: '16px',
    boxShadow: dark ? 'none' : '0 2px 10px rgba(0,0,0,.04)',
    transition: 'box-shadow .2s',
    '&:hover': { boxShadow: dark ? '0 4px 20px rgba(0,0,0,.28)' : '0 6px 22px rgba(0,0,0,.08)' },
  };

  const openCount   = rows.filter(r => r.status === 'open').length;
  const closedCount = rows.filter(r => r.status === 'closed').length;

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
            <HelpOutlineIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: '1.35rem', sm: '1.7rem' } }}>
              Αιτήματα Αρχείων
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2, fontSize: '0.82rem' }}>
              Αιτήματα χρηστών για ανεύρεση αρχείων
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {!loading && (
            <>
              <Chip label={`${openCount} ανοιχτά`} size="small" sx={{
                fontWeight: 700, fontSize: '0.72rem', borderRadius: '8px',
                background: alpha('#f57c00', 0.12), color: '#f57c00',
                border: '1px solid', borderColor: alpha('#f57c00', 0.22),
              }} />
              <Chip label={`${closedCount} κλειστά`} size="small" sx={{
                fontWeight: 700, fontSize: '0.72rem', borderRadius: '8px',
                background: alpha('#1e8e3e', 0.12), color: '#1e8e3e',
                border: '1px solid', borderColor: alpha('#1e8e3e', 0.22),
              }} />
            </>
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
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{ ...cb, p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Skeleton width="40%" height={22} />
                <Skeleton width={72} height={24} sx={{ borderRadius: '8px' }} />
              </Box>
              <Skeleton width="85%" height={55} sx={{ borderRadius: '10px' }} />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.5 }}>
                <Skeleton variant="rounded" width={90} height={32} sx={{ borderRadius: '10px' }} />
                <Skeleton variant="rounded" width={90} height={32} sx={{ borderRadius: '10px' }} />
              </Box>
            </Box>
          ))}
        </Stack>
      ) : rows.length === 0 ? (
        <Box sx={{ ...cb, py: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <HelpOutlineIcon sx={{ fontSize: 52, color: 'text.secondary', opacity: 0.25 }} />
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>Δεν υπάρχουν αιτήματα</Typography>
        </Box>
      ) : (
        <Stack spacing={1.75}>
          {rows.map(r => {
            const isOpen = r.status === 'open';
            return (
              <Box key={r.id} sx={cb}>
                <Box sx={{ p: { xs: 2, sm: 2.75 } }}>
                  {/* Top row */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.75, gap: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'primary.main', lineHeight: 1.25 }}>
                        {r.course}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, mt: 0.6, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                            {r.year} · {r.period}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AccessTimeIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
                          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                            {new Date(r.created_at).toLocaleDateString('el-GR')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Chip
                      label={isOpen ? 'Ανοιχτό' : 'Κλειστό'}
                      size="small"
                      sx={{
                        fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px', flexShrink: 0,
                        background:   isOpen ? alpha('#f57c00', 0.12) : alpha('#1e8e3e', 0.12),
                        color:        isOpen ? '#f57c00' : '#1e8e3e',
                        border: '1px solid',
                        borderColor:  isOpen ? alpha('#f57c00', 0.22) : alpha('#1e8e3e', 0.22),
                      }}
                    />
                  </Box>

                  {/* Message box */}
                  <Box sx={{
                    p: 1.75, borderRadius: '11px', mb: 2,
                    background: dark ? alpha('#fff', 0.03) : alpha('#000', 0.025),
                    border: '1px solid',
                    borderColor: dark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
                    display: 'flex', gap: 1.5,
                  }}>
                    <MessageIcon sx={{ fontSize: 17, color: 'text.secondary', mt: 0.2, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: '0.855rem', color: 'text.primary', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {r.details || <Box component="span" sx={{ fontStyle: 'italic', opacity: 0.45 }}>Δεν υπάρχει περιγραφή.</Box>}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      onClick={() => toggleStatus(r.id, r.status)}
                      startIcon={isOpen ? <CheckCircleOutlineIcon /> : <ReplayIcon />}
                      sx={{
                        borderRadius: '9px', textTransform: 'none', fontWeight: 700, px: 2,
                        background: isOpen ? alpha('#1e8e3e', 0.1) : alpha('#f57c00', 0.1),
                        color:      isOpen ? '#1e8e3e' : '#f57c00',
                        '&:hover':  { background: isOpen ? alpha('#1e8e3e', 0.18) : alpha('#f57c00', 0.18) },
                      }}
                    >
                      {isOpen ? 'Κλείσιμο' : 'Επαναφορά'}
                    </Button>
                    <Button
                      size="small"
                      onClick={() => setDeleteModal({ open: true, id: r.id })}
                      startIcon={<DeleteOutlineIcon />}
                      sx={{
                        borderRadius: '9px', textTransform: 'none', fontWeight: 700, px: 2,
                        background: alpha('#d32f2f', 0.08),
                        color: '#d32f2f',
                        '&:hover': { background: alpha('#d32f2f', 0.16) },
                      }}
                    >
                      Διαγραφή
                    </Button>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', background: dark ? '#1e1f23' : '#fff', border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' } }}
      >
        <DialogTitle sx={{ pt: 2.5, px: 3, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>Επιβεβαίωση Διαγραφής</Typography>
          <IconButton size="small" onClick={() => setDeleteModal({ open: false, id: null })} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 1 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτό το αίτημα; Η ενέργεια δεν μπορεί να αναιρεθεί.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button onClick={() => setDeleteModal({ open: false, id: null })} sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>
            Ακύρωση
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            startIcon={<DeleteOutlineIcon />}
            sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}
          >
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminRequests;
