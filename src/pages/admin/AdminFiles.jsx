import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert, TablePagination, TextField, InputAdornment, Card, CardContent, CardActions, Stack, Skeleton, Tabs, Tab, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, useMediaQuery } from '@mui/material';
import { supabase } from '../../supabaseClient';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import DoneIcon from '@mui/icons-material/Done';

const AdminFiles = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [users, setUsers] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [tab, setTab] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, file_url: null });

  const cardBg = {
    background: '#f8fafc',
    boxShadow: '0 2px 12px 0 rgba(31,38,135,0.08)',
    borderRadius: '18px',
    border: '1px solid #e3eafc',
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setExams(data);
    setLoading(false);
  };

  useEffect(() => { fetchExams(); }, []);

  useEffect(() => {
    // Fetch emails των uploaders αν υπάρχει view/table
    const getUploaderEmails = async () => {
      const uploaderIds = [...new Set(exams.map(e => e.uploader).filter(Boolean))];
      if (uploaderIds.length === 0) return;
      const { data } = await supabase.from('profiles').select('id,first_name,last_name,email').in('id', uploaderIds);
      if (data) {
        const map = {};
        data.forEach(u => {
          map[u.id] = (u.first_name || u.last_name) ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : (u.email || u.id);
        });
        setUsers(map);
      }
    };
    getUploaderEmails();
  }, [exams]);

  const handleApprove = async (id) => {
    setError(''); setSuccess('');
    const { error } = await supabase.from('exams').update({ approved: true }).eq('id', id);
    if (error) setError(error.message);
    else { setSuccess('Εγκρίθηκε!'); fetchExams(); }
  };

  const handleDelete = async (id, file_url) => {
    setError(''); setSuccess('');
    // Διαγραφή από storage
    const filePath = file_url.split('/exams/')[1];
    if (filePath) {
      await supabase.storage.from('exams').remove([filePath]);
    }
    // Διαγραφή από DB
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) setError(error.message);
    else { setSuccess('Διαγράφηκε!'); fetchExams(); }
  };

  // Search & Pagination
  const filteredExams = exams.filter(exam => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (exam.title && exam.title.toLowerCase().includes(s)) ||
      (exam.course && exam.course.toLowerCase().includes(s)) ||
      (exam.period && exam.period.toLowerCase().includes(s)) ||
      (exam.year && String(exam.year).includes(s))
    );
  });
  const filteredByTab = filteredExams.filter(exam => tab === 0 ? !exam.approved : exam.approved);
  const paginatedExams = filteredByTab.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleOpenDelete = (id, file_url) => setConfirmDelete({ open: true, id, file_url });
  const handleCloseDelete = () => setConfirmDelete({ open: false, id: null, file_url: null });
  const handleConfirmDelete = async () => {
    if (confirmDelete.id && confirmDelete.file_url) {
      await handleDelete(confirmDelete.id, confirmDelete.file_url);
    }
    handleCloseDelete();
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" color="#111" fontWeight={700} gutterBottom align="left">
        ΔΙΑΧΕΙΡΙΣΗ ΑΡΧΕΙΩΝ
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Stack direction={isMobile ? 'column' : 'row'} spacing={2} sx={{ mb: 2, alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'flex-end' }}>
        <TextField
          placeholder="ΑΝΑΖΗΤΗΣΗ..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, minWidth: isMobile ? 0 : 200 }}
        />
      </Stack>
      <Tabs value={tab} onChange={(_, v) => { setTab(v); setPage(0); }} sx={{ mb: 2 }} centered>
        <Tab label="Εκκρεμούν" icon={<HourglassEmptyIcon />} iconPosition="start" sx={{ textTransform: 'none' }} />
        <Tab label="Εγκεκριμένα" icon={<CheckCircleIcon />} iconPosition="start" sx={{ textTransform: 'none' }} />
      </Tabs>
      {loading ? (
        <Box sx={{ mt: 2 }}>
          {isMobile ? (
            <Stack spacing={2}>
              {[...Array(3)].map((_, i) => (
                <Box key={i} sx={{ ...cardBg, mb: 2, p: 2 }}>
                  <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="text" width="30%" height={24} />
                  <Skeleton variant="text" width="30%" height={24} />
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={24} />
                  <Skeleton variant="rectangular" width="100%" height={36} sx={{ mt: 2 }} />
                </Box>
              ))}
            </Stack>
          ) : (
            <TableContainer component={Paper} sx={{ ...cardBg, boxShadow: 'none', mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: '#f4f6fa' }}>
                    <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16 }}>Μάθημα</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16 }}>Έτος</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16 }}>Εξεταστική</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16 }}>Uploader</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16 }}>Ενέργειες</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                      <TableCell><Skeleton variant="text" width="40%" /></TableCell>
                      <TableCell><Skeleton variant="rectangular" width={80} height={32} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ) : isMobile ? (
        <Stack spacing={2}>
          {paginatedExams.length === 0 ? (
            <Typography align="center">Δεν βρέθηκαν αρχεία.</Typography>
          ) : (
            paginatedExams.map((exam) => (
              <Box key={exam.id} sx={{ ...cardBg, mb: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Μάθημα: <span style={{ fontWeight: 400 }}>{exam.course}</span></Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Έτος: <span style={{ fontWeight: 400 }}>{exam.year}</span></Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Εξεταστική: <span style={{ fontWeight: 400 }}>{exam.period}</span></Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Uploader: <span style={{ fontWeight: 400 }}>{users[exam.uploader] || exam.uploader}</span></Typography>
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={exam.approved ? 'Εγκεκριμένο' : 'Εκκρεμεί'}
                    color={exam.approved ? 'success' : 'warning'}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: 13, borderRadius: 1 }}
                  />
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {!exam.approved && (
                    <Tooltip title="Έγκριση">
                      <Button color="success" size="small" onClick={() => handleApprove(exam.id)} sx={{ textTransform: 'none', background: '#e8f5e9', borderRadius: 1, '&:hover': { background: '#c8e6c9' } }}><DoneIcon /></Button>
                    </Tooltip>
                  )}
                  <Tooltip title="Προβολή">
                    <Button color="info" size="small" href={exam.file_url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', background: '#e3f2fd', borderRadius: 1, '&:hover': { background: '#bbdefb' } }}><VisibilityIcon /></Button>
                  </Tooltip>
                  <Tooltip title="Διαγραφή">
                    <Button color="error" size="small" onClick={() => handleOpenDelete(exam.id, exam.file_url)} sx={{ textTransform: 'none', background: '#ffebee', borderRadius: 1, '&:hover': { background: '#ffcdd2' } }}><DeleteIcon /></Button>
                  </Tooltip>
                  <Tooltip title="Λήψη">
                    <Button color="primary" size="small" href={exam.file_url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', background: '#e3eafc', borderRadius: 1, '&:hover': { background: '#c5cae9' } }}><DownloadIcon /></Button>
                  </Tooltip>
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ ...cardBg, boxShadow: 'none', mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ background: '#f4f6fa' }}>
                <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16 }}>Μάθημα</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16 }}>Έτος</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16 }}>Εξεταστική</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16 }}>Uploader</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16 }}>Ενέργειες</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedExams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">Δεν βρέθηκαν αρχεία.</TableCell>
                </TableRow>
              ) : (
                paginatedExams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>{exam.course}</TableCell>
                    <TableCell>{exam.year}</TableCell>
                    <TableCell>{exam.period}</TableCell>
                    <TableCell>{users[exam.uploader] || exam.uploader}</TableCell>
                    <TableCell>
                      <Chip
                        label={exam.approved ? 'Εγκεκριμένο' : 'Εκκρεμεί'}
                        color={exam.approved ? 'success' : 'warning'}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: 13, borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {!exam.approved && (
                          <Tooltip title="Έγκριση">
                            <Button color="success" size="small" onClick={() => handleApprove(exam.id)} sx={{ textTransform: 'none', background: '#e8f5e9', borderRadius: 1, '&:hover': { background: '#c8e6c9' } }}><DoneIcon /></Button>
                          </Tooltip>
                        )}
                        <Tooltip title="Προβολή">
                          <Button color="info" size="small" href={exam.file_url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', background: '#e3f2fd', borderRadius: 1, '&:hover': { background: '#bbdefb' } }}><VisibilityIcon /></Button>
                        </Tooltip>
                        <Tooltip title="Διαγραφή">
                          <Button color="error" size="small" onClick={() => handleOpenDelete(exam.id, exam.file_url)} sx={{ textTransform: 'none', background: '#ffebee', borderRadius: 1, '&:hover': { background: '#ffcdd2' } }}><DeleteIcon /></Button>
                        </Tooltip>
                        <Tooltip title="Λήψη">
                          <Button color="primary" size="small" href={exam.file_url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', background: '#e3eafc', borderRadius: 1, '&:hover': { background: '#c5cae9' } }}><DownloadIcon /></Button>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredExams.length}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </TableContainer>
      )}
      <Dialog open={confirmDelete.open} onClose={handleCloseDelete} fullWidth maxWidth="xs" PaperProps={{ sx: { ...cardBg, p: 2 } }}>
        <DialogTitle>Επιβεβαίωση Διαγραφής</DialogTitle>
        <DialogContent>Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτό το αρχείο;</DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} sx={{ textTransform: 'none' }}>Ακύρωση</Button>
          <Button onClick={handleConfirmDelete} color="error" sx={{ textTransform: 'none' }}>Διαγραφή</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminFiles; 