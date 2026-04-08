import React, { useEffect, useState } from 'react';
import {
  Box, Paper, Typography, IconButton, Chip, Alert, Stack,
  useTheme, useMediaQuery, Card, CardContent, Grid, Button,
  Tooltip, Divider, alpha, Skeleton,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MessageIcon from '@mui/icons-material/Message';
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
          label={`${count} αιτήματα`}
          sx={{
            fontWeight: 700,
            background: isDark ? alpha('#1a73e8', 0.15) : alpha('#1a73e8', 0.1),
            color: 'primary.main', border: '1px solid', borderColor: alpha('#1a73e8', 0.2), borderRadius: '10px',
          }}
        />
      )}
    </Box>
  );
};

const AdminRequests = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const fetchRows = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from('file_requests')
      .select('id,course,year,period,details,status,created_at,requester')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRows(); }, []);

  const toggleStatus = async (id, status) => {
    setError('');
    setSuccess('');
    const next = status === 'open' ? 'closed' : 'open';
    const { error } = await supabase.from('file_requests').update({ status: next }).eq('id', id);
    if (error) setError(error.message);
    else {
      setSuccess('Η κατάσταση ενημερώθηκε!');
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Σίγουρα θέλεις να διαγράψεις αυτό το αίτημα;')) return;
    setError('');
    setSuccess('');
    const { error } = await supabase.from('file_requests').delete().eq('id', id);
    if (error) setError(error.message);
    else {
      setSuccess('Το αίτημα διαγράφηκε!');
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const cardStyle = {
    p: 2.5, borderRadius: '16px',
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
        title="Αιτήματα Αρχείων"
        subtitle="Διαχείριση αιτημάτων από χρήστες για νέα αρχεία"
        icon={<HelpOutlineIcon />}
        count={loading ? undefined : rows.length}
      />

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

      {loading ? (
        <Stack spacing={2}>
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ ...cardStyle }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Skeleton width="40%" height={24} />
                <Skeleton width={80} height={24} sx={{ borderRadius: '8px' }} />
              </Box>
              <Skeleton width="90%" height={60} sx={{ borderRadius: '10px' }} />
            </Box>
          ))}
        </Stack>
      ) : rows.length === 0 ? (
        <Box sx={{ ...cardStyle, py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <HelpOutlineIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3 }} />
          <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>Δεν υπάρχουν αιτήματα αρχείων</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {rows.map((r) => (
            <Box key={r.id} sx={cardStyle}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', lineHeight: 1.2 }}>
                    {r.course}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>{r.year} · {r.period}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                      <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary' }}>
                        {new Date(r.created_at).toLocaleDateString('el-GR')}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Chip
                  label={r.status === 'closed' ? 'Κλειστό' : 'Ανοιχτό'}
                  size="small"
                  sx={{
                    fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px',
                    background: r.status === 'closed' ? alpha('#1e8e3e', 0.12) : alpha('#f57c00', 0.12),
                    color: r.status === 'closed' ? '#1e8e3e' : '#f57c00',
                    border: '1px solid', borderColor: r.status === 'closed' ? alpha('#1e8e3e', 0.2) : alpha('#f57c00', 0.2),
                  }}
                />
              </Box>

              <Box sx={{
                p: 2, borderRadius: '12px', mb: 2,
                background: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                border: '1px solid', borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                display: 'flex', gap: 1.5,
              }}>
                <MessageIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'text.primary', fontSize: '0.85rem' }}>
                  {r.details || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Καμία λεπτομέρεια</span>}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Tooltip title={r.status === 'open' ? 'Κλείσιμο Αιτήματος' : 'Επαναφορά (Άνοιγμα)'} arrow>
                  <Button
                    size="small"
                    onClick={() => toggleStatus(r.id, r.status)}
                    startIcon={r.status === 'open' ? <CheckCircleOutlineIcon /> : <ReplayIcon />}
                    sx={{
                      borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                      background: r.status === 'open' ? alpha('#1e8e3e', 0.1) : alpha('#f57c00', 0.1),
                      color: r.status === 'open' ? '#1e8e3e' : '#f57c00',
                      '&:hover': { background: r.status === 'open' ? alpha('#1e8e3e', 0.18) : alpha('#f57c00', 0.18) },
                    }}
                  >
                    {r.status === 'open' ? 'Κλείσιμο' : 'Άνοιγμα'}
                  </Button>
                </Tooltip>
                <Tooltip title="Διαγραφή Αιτήματος" arrow>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(r.id)}
                    startIcon={<DeleteOutlineIcon />}
                    sx={{
                      borderRadius: '10px', textTransform: 'none', fontWeight: 600,
                      background: alpha('#d32f2f', 0.1),
                      '&:hover': { background: alpha('#d32f2f', 0.18) },
                    }}
                  >
                    Διαγραφή
                  </Button>
                </Tooltip>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default AdminRequests;
