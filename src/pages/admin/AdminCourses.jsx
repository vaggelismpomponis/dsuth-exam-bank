import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Button, TextField, IconButton, Alert, Skeleton,
  useTheme, useMediaQuery, alpha, Chip, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment } from '@mui/material';
import { supabase } from '../../supabaseClient';

const SemesterBadge = ({ semester }) => {
  const colors = [
    '#1a73e8', '#1565c0', '#0d47a1', '#1b5e20',
    '#e65100', '#6a1b9a', '#880e4f', '#004d40',
  ];
  const color = colors[(semester - 1) % colors.length] || '#1a73e8';
  return (
    <Box sx={{
      px: 1.5, py: 0.4, borderRadius: '8px',
      background: alpha(color, 0.12),
      border: '1px solid', borderColor: alpha(color, 0.25),
      display: 'inline-flex', alignItems: 'center',
    }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color, lineHeight: 1 }}>
        {semester}ο Εξ.
      </Typography>
    </Box>
  );
};

const AdminCourses = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [saving, setSaving] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editCourse, setEditCourse] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [courseSemester, setCourseSemester] = useState(1);
  const [search, setSearch] = useState('');

  const cardBg = {
    background: isDark ? alpha('#fff', 0.04) : '#ffffff',
    border: '1px solid',
    borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    borderRadius: '16px',
    boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)',
  };

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    const { data, error } = await supabase.from('courses').select('*').order('semester', { ascending: true }).order('name', { ascending: true });
    if (error) setError(error.message);
    else setCourses(data);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleOpenDialog = (course = null) => {
    setEditCourse(course);
    setCourseName(course ? course.name : '');
    setCourseSemester(course ? course.semester : 1);
    setError('');
    setSuccess('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditCourse(null);
    setCourseName('');
    setCourseSemester(1);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    if (!courseName.trim()) { setError('Το όνομα μαθήματος είναι υποχρεωτικό.'); setSaving(false); return; }
    if (courseSemester < 1 || courseSemester > 8) { setError('Το εξάμηνο πρέπει να είναι 1-8.'); setSaving(false); return; }

    if (editCourse) {
      const { error } = await supabase.from('courses').update({ name: courseName.trim(), semester: courseSemester }).eq('id', editCourse.id);
      if (error) { setError(error.message); setSaving(false); return; }
      setSuccess('Το μάθημα ενημερώθηκε!');
    } else {
      const { error } = await supabase.from('courses').insert([{ name: courseName.trim(), semester: courseSemester }]);
      if (error) { setError(error.message); setSaving(false); return; }
      setSuccess('Το μάθημα προστέθηκε!');
    }
    setSaving(false);
    fetchCourses();
    handleCloseDialog();
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    setDeletingId(confirmDeleteId);
    setError('');
    const { error } = await supabase.from('courses').delete().eq('id', confirmDeleteId);
    if (error) setError(error.message);
    else { setSuccess('Το μάθημα διαγράφηκε!'); fetchCourses(); }
    setDeletingId(null);
    setConfirmDeleteId(null);
  };

  const filtered = courses.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  // Group by semester
  const grouped = filtered.reduce((acc, course) => {
    const sem = course.semester;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(course);
    return acc;
  }, {});

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '14px',
            background: 'linear-gradient(135deg, #1a73e8 0%, #0052cc 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(26,115,232,0.35)',
          }}>
            <MenuBookIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
              Διαχείριση Μαθημάτων
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2 }}>
              {loading ? '...' : `${courses.length} μαθήματα σε ${Object.keys(grouped).length} εξάμηνα`}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none', px: 2.5 }}
        >
          Νέο Μάθημα
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Αναζήτηση μαθήματος..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
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

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={cardBg}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Skeleton width={100} height={20} />
              </Box>
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {[...Array(3)].map((_, j) => (
                  <Box key={j} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Skeleton width="60%" height={18} />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '10px' }} />
                      <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '10px' }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ ...cardBg, py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <MenuBookIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.3 }} />
          <Typography sx={{ color: 'text.secondary', fontWeight: 500 }}>Δεν βρέθηκαν μαθήματα</Typography>
          <Button onClick={() => handleOpenDialog()} startIcon={<AddIcon />} sx={{ mt: 1, borderRadius: '10px', textTransform: 'none' }}>
            Προσθήκη πρώτου μαθήματος
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map(sem => (
            <Box key={sem} sx={cardBg}>
              {/* Semester header */}
              <Box sx={{
                px: 2.5, py: 1.5,
                borderBottom: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', gap: 1.5,
                background: isDark ? alpha('#fff', 0.02) : alpha('#1a73e8', 0.03),
              }}>
                <SemesterBadge semester={Number(sem)} />
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
                  {grouped[sem].length} μαθήματα
                </Typography>
              </Box>
              {/* Courses in semester */}
              <Box>
                {grouped[sem].map((course, idx) => (
                  <Box
                    key={course.id}
                    sx={{
                      px: 2.5, py: 1.75,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderBottom: idx < grouped[sem].length - 1 ? '1px solid' : 'none',
                      borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                      transition: 'background 0.15s',
                      '&:hover': { background: isDark ? alpha('#fff', 0.02) : alpha('#1a73e8', 0.02) },
                    }}
                  >
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {course.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0 }}>
                      <Tooltip title="Επεξεργασία" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(course)}
                          sx={{
                            width: 32, height: 32, borderRadius: '9px',
                            background: isDark ? alpha('#1a73e8', 0.12) : alpha('#1a73e8', 0.08),
                            color: 'primary.main',
                            '&:hover': { background: isDark ? alpha('#1a73e8', 0.2) : alpha('#1a73e8', 0.14) },
                          }}
                        >
                          <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Διαγραφή" arrow>
                        <IconButton
                          size="small"
                          onClick={() => setConfirmDeleteId(course.id)}
                          disabled={deletingId === course.id}
                          sx={{
                            width: 32, height: 32, borderRadius: '9px',
                            background: isDark ? alpha('#d32f2f', 0.12) : alpha('#d32f2f', 0.08),
                            color: '#d32f2f',
                            '&:hover': { background: isDark ? alpha('#d32f2f', 0.2) : alpha('#d32f2f', 0.14) },
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: isDark ? '#1e1f23' : '#fff',
            border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          },
        }}
      >
        <DialogTitle sx={{ pt: 2.5, px: 3, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
            {editCourse ? 'Επεξεργασία Μαθήματος' : 'Νέο Μάθημα'}
          </Typography>
          <IconButton size="small" onClick={handleCloseDialog} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1 }}>
          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setError('')}>{error}</Alert>}
          <TextField
            label="Όνομα Μαθήματος"
            value={courseName}
            onChange={e => setCourseName(e.target.value)}
            fullWidth
            autoFocus
            sx={{ mb: 2 }}
          />
          <TextField
            label="Εξάμηνο (1-8)"
            type="number"
            value={courseSemester}
            onChange={e => setCourseSemester(Number(e.target.value))}
            fullWidth
            inputProps={{ min: 1, max: 8 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, flex: 1 }}>
            Ακύρωση
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving}
            startIcon={<SaveIcon />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, flex: 1 }}
          >
            {editCourse ? 'Αποθήκευση' : 'Προσθήκη'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog
        open={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: isDark ? '#1e1f23' : '#fff',
            border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pt: 2.5 }}>Διαγραφή Μαθήματος</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary' }}>
            Σίγουρα θέλεις να διαγράψεις αυτό το μάθημα; Τα αρχεία που ανήκουν σε αυτό δεν θα επηρεαστούν.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setConfirmDeleteId(null)} sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 600, flex: 1 }}>
            Ακύρωση
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={<DeleteOutlineIcon />}
            sx={{ borderRadius: '10px', textTransform: 'none', fontWeight: 700, flex: 1 }}
          >
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCourses;