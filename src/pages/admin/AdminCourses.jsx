import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, TextField, Stack, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Skeleton, useTheme, useMediaQuery } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { supabase } from '../../supabaseClient';

const cardBg = {
  background: '#f8fafc',
  boxShadow: '0 2px 12px 0 rgba(31,38,135,0.08)',
  borderRadius: '18px',
  border: '1px solid #e3eafc',
};

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [courseSemester, setCourseSemester] = useState(1);
  const [saving, setSaving] = useState(false);

  const theme = useTheme();
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
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 600, ...cardBg, p: { xs: 2, sm: 4 }, mb: 2 }}>
<<<<<<< HEAD
        <Typography variant="h4" color="#111" fontWeight={700} gutterBottom align="left" sx={{ letterSpacing: 1, textTransform: 'none' }}>
=======
        <Typography variant="h4" color="#212121" fontWeight={700} gutterBottom align="left" sx={{ letterSpacing: 1, textTransform: 'none' }}>
>>>>>>> 0e5f73e (fix: σωστό .gitignore, προστασία admin routes, cleanup node_modules από git, πλήρες setup για prod)
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
          <TableContainer component={Paper} sx={{ ...cardBg, boxShadow: 'none', mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16, textTransform: 'none' }}>Όνομα Μαθήματος</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16, textTransform: 'none' }}>Εξάμηνο</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#1a237e', fontSize: 16, textTransform: 'none' }}>Ενέργειες</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.length === 0 ? (
                  <TableRow><TableCell colSpan={3} align="center">Δεν υπάρχουν μαθήματα.</TableCell></TableRow>
                ) : courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>{course.name}</TableCell>
                    <TableCell align="center">{course.semester}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <IconButton onClick={() => handleOpenDialog(course)} color="primary"><EditIcon /></IconButton>
                        <IconButton color="error" onClick={() => handleDelete(course.id)}><DeleteIcon /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="xs" PaperProps={{ sx: { ...cardBg, p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#1a237e', textAlign: 'center', textTransform: 'none' }}>{editCourse ? 'Επεξεργασία Μαθήματος' : 'Προσθήκη Μαθήματος'}</DialogTitle>
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
    </Container>
  );
};

export default AdminCourses; 