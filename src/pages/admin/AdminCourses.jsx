import React, { useEffect, useState } from 'react';
import { Typography, Box, Button, TextField, Stack, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Skeleton, useTheme, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { supabase } from '../../supabaseClient';

const AdminCourses = () => {
  const theme = useTheme();

  const cardBg = {
    background: theme.palette.mode === 'light' ? '#f8fafc' : 'background.paper',
    boxShadow: theme.palette.mode === 'light' ? '0 2px 12px 0 rgba(31,38,135,0.08)' : '0 4px 20px 0 rgba(0,0,0,0.4)',
    borderRadius: '18px',
    border: `1px solid ${theme.palette.mode === 'light' ? '#e3eafc' : 'rgba(255,255,255,0.05)'}`,
  };

  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [courseSemester, setCourseSemester] = useState(1);
  const isMobileOrTablet = useMediaQuery('(max-width:899px)');

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('courses').select('*').order('name', { ascending: true });
    if (error) setError(error.message);
    else setCourses(data);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleOpenDialog = (course = null) => {
    setEditCourse(course);
    setCourseName(course ? course.name : '');
    setCourseSemester(course ? course.semester : 1);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditCourse(null);
    setCourseName('');
    setCourseSemester(1);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    if (!courseName.trim()) {
      setError('Το όνομα μαθήματος είναι υποχρεωτικό.');
      setSaving(false);
      return;
    }
    if (courseSemester < 1 || courseSemester > 8) {
      setError('Το εξάμηνο πρέπει να είναι από 1 έως 8.');
      setSaving(false);
      return;
    }
    if (editCourse) {
      // Update
      const { error } = await supabase.from('courses').update({ name: courseName.trim(), semester: courseSemester }).eq('id', editCourse.id);
      if (error) setError(error.message);
      else setSuccess('Το μάθημα ενημερώθηκε!');
    } else {
      // Insert
      const { error } = await supabase.from('courses').insert([{ name: courseName.trim(), semester: courseSemester }]);
      if (error) setError(error.message);
      else setSuccess('Το μάθημα προστέθηκε!');
    }
    setSaving(false);
    fetchCourses();
    handleCloseDialog();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Σίγουρα θέλεις να διαγράψεις το μάθημα;')) return;
    setError('');
    setSuccess('');
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) setError(error.message);
    else setSuccess('Το μάθημα διαγράφηκε!');
    fetchCourses();
  };

  return (
    <Box sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
      <Box sx={{ width: '100%', maxWidth: 600, ...cardBg, p: { xs: 2, sm: 4 }, mb: 2 }}>
        <Typography variant="h4" color={theme.palette.mode === 'light' ? '#212121' : 'text.primary'} fontWeight={700} gutterBottom align="left" sx={{ letterSpacing: 1, textTransform: 'none' }}>
          Διαχείριση Μαθημάτων
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ mb: 2, borderRadius: 2, fontWeight: 600, fontSize: 16, textTransform: 'none' }}>
          Προσθήκη Μαθήματος
        </Button>
        {loading ? (
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
        ) : isMobileOrTablet ? (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {courses.length === 0 ? (
              <Typography align="center">Δεν υπάρχουν μαθήματα.</Typography>
            ) : courses.map((course) => (
              <Box key={course.id} sx={{ ...cardBg, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Όνομα: <span style={{ fontWeight: 400 }}>{course.name}</span></Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Εξάμηνο: <span style={{ fontWeight: 400 }}>{course.semester}</span></Typography>
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'row', gap: 1 }}>
                  <IconButton onClick={() => handleOpenDialog(course)} color="primary"><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(course.id)}><DeleteIcon /></IconButton>
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <TableContainer component={Paper} sx={{ ...cardBg, mt: 2, overflow: 'hidden' }}>
            <Table sx={{ minWidth: 650 }} aria-label="admin courses table">
              <TableHead>
                <TableRow sx={{ background: theme.palette.mode === 'light' ? '#f4f6fa' : 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 15, py: 2, textTransform: 'none' }}>Όνομα Μαθήματος</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 15, py: 2, textTransform: 'none' }}>Εξάμηνο</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', fontSize: 15, py: 2, pr: 3, textTransform: 'none' }}>Ενέργειες</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3 }}>Δεν υπάρχουν μαθήματα.</TableCell></TableRow>
                ) : courses.map((course) => (
                  <TableRow key={course.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)' } }}>
                    <TableCell sx={{ py: 2, fontWeight: 500 }}>{course.name}</TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>{course.semester}</TableCell>
                    <TableCell align="right" sx={{ py: 2, pr: 3 }}>
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleOpenDialog(course)}
                          sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            px: 2,
                            py: 0.75,
                            boxShadow: theme.palette.mode === 'light' ? 1 : 0,
                            background: theme.palette.mode === 'light' ? '#e3f2fd' : 'rgba(33, 150, 243, 0.1)',
                            color: theme.palette.mode === 'light' ? '#1976d2' : '#64b5f6',
                            textTransform: 'none',
                            '&:hover': {
                              background: theme.palette.mode === 'light' ? '#bbdefb' : 'rgba(33, 150, 243, 0.2)',
                              boxShadow: theme.palette.mode === 'light' ? 2 : 0
                            }
                          }}
                        >
                          Επεξεργασία
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(course.id)}
                          sx={{
                            borderRadius: 1.5,
                            fontWeight: 600,
                            px: 2,
                            py: 0.75,
                            boxShadow: theme.palette.mode === 'light' ? 1 : 0,
                            background: theme.palette.mode === 'light' ? '#ffebee' : 'rgba(244, 67, 54, 0.1)',
                            color: theme.palette.mode === 'light' ? '#d32f2f' : '#e57373',
                            textTransform: 'none',
                            '&:hover': {
                              background: theme.palette.mode === 'light' ? '#ffcdd2' : 'rgba(244, 67, 54, 0.2)',
                              boxShadow: theme.palette.mode === 'light' ? 2 : 0
                            }
                          }}
                        >
                          Διαγραφή
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="xs" PaperProps={{ sx: { ...cardBg, p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: theme.palette.mode === 'light' ? '#1a237e' : 'primary.main', textAlign: 'center', textTransform: 'none' }}>{editCourse ? 'Επεξεργασία Μαθήματος' : 'Προσθήκη Μαθήματος'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Όνομα Μαθήματος"
            value={courseName}
            onChange={e => setCourseName(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            label="Εξάμηνο"
            type="number"
            value={courseSemester}
            onChange={e => setCourseSemester(Number(e.target.value))}
            fullWidth
            sx={{ mb: 2 }}
            inputProps={{ min: 1, max: 8 }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 2, textTransform: 'none' }}>Ακύρωση</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving} sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}>{editCourse ? 'Αποθήκευση' : 'Προσθήκη'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCourses; 