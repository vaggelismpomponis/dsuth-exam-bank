import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  Stack,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import { supabase } from '../../supabaseClient';

const AdminRequests = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();

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

  useEffect(() => {
    fetchRows();
  }, []);

  const toggleStatus = async (id, status) => {
    setError('');
    setSuccess('');
    const next = status === 'open' ? 'closed' : 'open';
    const { error } = await supabase
      .from('file_requests')
      .update({ status: next })
      .eq('id', id);
    if (error) setError(error.message);
    else {
      setSuccess('Αποθήκευση επιτυχής');
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: next } : r)));
    }
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccess('');
    const { error } = await supabase.from('file_requests').delete().eq('id', id);
    if (error) setError(error.message);
    else {
      setSuccess('Διαγραφή επιτυχής');
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Διαχείριση Αιτημάτων Αρχείων</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <TableContainer component={Paper} sx={{
        background: theme.palette.mode === 'light' ? '#f8fafc' : 'background.paper',
        boxShadow: theme.palette.mode === 'light' ? '0 2px 12px 0 rgba(31,38,135,0.08)' : '0 4px 20px 0 rgba(0,0,0,0.4)',
        borderRadius: '18px',
        border: `1px solid ${theme.palette.mode === 'light' ? '#e3eafc' : 'rgba(255,255,255,0.05)'}`,
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: theme.palette.mode === 'light' ? '#f4f6fa' : 'background.default' }}>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16 }}>Μάθημα</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16 }}>Έτος</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16 }}>Εξεταστική</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16, width: 520 }}>Λεπτομέρειες</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16 }}>Κατάσταση</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16 }}>Ημ/νία</TableCell>
              <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 16 }}>Ενέργειες</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rows || []).map((r, idx) => (
              <TableRow key={r.id}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{r.course}</TableCell>
                <TableCell>{r.year}</TableCell>
                <TableCell>{r.period}</TableCell>
                <TableCell sx={{ maxWidth: 520, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.details}</TableCell>
                <TableCell>
                  <Chip label={r.status === 'closed' ? 'Κλειστό' : 'Ανοιχτό'} color={r.status === 'closed' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 700 }} />
                </TableCell>
                <TableCell>{new Date(r.created_at).toLocaleDateString('el-GR')}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton color={r.status === 'open' ? 'success' : 'warning'} onClick={() => toggleStatus(r.id, r.status)} size="small" title={r.status === 'open' ? 'Κλείσιμο' : 'Άνοιγμα'}>
                      {r.status === 'open' ? <CheckCircleIcon /> : <ReplayIcon />}
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(r.id)} size="small" title="Διαγραφή">
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {!rows?.length && !loading && (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Δεν υπάρχουν αιτήματα.</Typography>
      )}
      {loading && (
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>Φόρτωση...</Typography>
      )}
    </Box>
  );
};

export default AdminRequests;


