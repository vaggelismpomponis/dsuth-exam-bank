import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, IconButton, Button,
  Alert, Skeleton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  useTheme, alpha, Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { supabase } from '../../supabaseClient';

/* ─── Semester colour map ─── */
const SEM_COLORS = ['#1a73e8', '#1565c0', '#0d47a1', '#1b5e20', '#e65100', '#6a1b9a', '#880e4f', '#004d40'];
const semColor = (n) => SEM_COLORS[(n - 1) % SEM_COLORS.length];

const SemBadge = ({ n }) => {
  const c = semColor(n);
  return (
    <Box sx={{
      px: 1.25, py: 0.3, borderRadius: '7px',
      background: alpha(c, 0.12), border: '1px solid', borderColor: alpha(c, 0.25),
      display: 'inline-flex', alignItems: 'center', flexShrink: 0,
    }}>
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: c, lineHeight: 1 }}>
        Εξ. {n}
      </Typography>
    </Box>
  );
};

/* ─── Main ─── */
const AdminCourses = () => {
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [alert, setAlert] = useState({ type: '', msg: '' });
  const [dialog, setDialog] = useState({ open: false, course: null });
  const [confirmDel, setConfirmDel] = useState(null);   // course id
  const [form, setForm] = useState({ name: '', semester: 1 });

  const notify = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('courses').select('*').order('semester').order('name');
    setCourses(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setDialog({ open: true, course: null }); setForm({ name: '', semester: 1 }); };
  const openEdit = (c) => { setDialog({ open: true, course: c }); setForm({ name: c.name, semester: c.semester }); };
  const closeDialog = () => setDialog({ open: false, course: null });

  const handleSave = async () => {
    if (!form.name.trim()) { notify('error', 'Το όνομα είναι υποχρεωτικό.'); return; }
    if (form.semester < 1 || form.semester > 8) { notify('error', 'Το εξάμηνο πρέπει να είναι 1–8.'); return; }
    setSaving(true);
    if (dialog.course) {
      const { error } = await supabase.from('courses').update({ name: form.name.trim(), semester: +form.semester }).eq('id', dialog.course.id);
      if (error) { notify('error', error.message); setSaving(false); return; }
      notify('success', 'Το μάθημα ενημερώθηκε!');
    } else {
      const { error } = await supabase.from('courses').insert([{ name: form.name.trim(), semester: +form.semester }]);
      if (error) { notify('error', error.message); setSaving(false); return; }
      notify('success', 'Το μάθημα προστέθηκε!');
    }
    setSaving(false);
    closeDialog();
    load();
  };

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(confirmDel);
    const { error } = await supabase.from('courses').delete().eq('id', confirmDel);
    if (error) notify('error', error.message);
    else { notify('success', 'Το μάθημα διαγράφηκε!'); load(); }
    setDeleting(null);
    setConfirmDel(null);
  };

  /* group by semester */
  const filtered = courses.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  const grouped = filtered.reduce((acc, c) => {
    const s = c.semester;
    if (!acc[s]) acc[s] = [];
    acc[s].push(c);
    return acc;
  }, {});
  const semesters = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  const cb = {
    background: dark ? alpha('#fff', 0.04) : '#fff',
    border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    borderRadius: '16px',
    boxShadow: dark ? 'none' : '0 2px 10px rgba(0,0,0,.04)',
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '13px',
            background: 'linear-gradient(135deg,#1a73e8,#0052cc)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: '0 4px 14px rgba(26,115,232,.35)',
          }}>
            <MenuBookIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: '1.35rem', sm: '1.7rem' } }}>
              Διαχείριση Μαθημάτων
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2, fontSize: '0.82rem' }}>
              Μαθήματα και διαχείριση εξαμήνων
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          {!loading && (
            <Chip label={`${courses.length} μαθήματα`} size="small" sx={{
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
          <Button
            variant="contained" startIcon={<AddIcon />} onClick={openAdd}
            sx={{ borderRadius: '11px', fontWeight: 700, textTransform: 'none', px: 2.5, boxShadow: '0 4px 14px rgba(26,115,232,.3)' }}
          >
            Νέο Μάθημα
          </Button>
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
          placeholder="Αναζήτηση μαθήματος..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: 'text.secondary' }} /></InputAdornment>,
            sx: { borderRadius: '11px', background: dark ? alpha('#fff', 0.05) : '#fff', fontSize: '0.875rem' },
          }}
          sx={{ width: '100%', maxWidth: { xs: '100%', sm: 340 } }}
        />
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={cb}>
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}><Skeleton width={90} height={20} /></Box>
              {[...Array(3)].map((_, j) => (
                <Box key={j} sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton width="55%" height={18} />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: '9px' }} />
                    <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: '9px' }} />
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      ) : filtered.length === 0 ? (
        <Box sx={{ ...cb, py: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <MenuBookIcon sx={{ fontSize: 52, color: 'text.secondary', opacity: 0.25 }} />
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>Δεν βρέθηκαν μαθήματα</Typography>
          <Button startIcon={<AddIcon />} onClick={openAdd} sx={{ mt: 0.5, borderRadius: '10px', textTransform: 'none' }}>
            Προσθήκη πρώτου μαθήματος
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {semesters.map(sem => (
            <Box key={sem} sx={cb}>
              {/* Semester row */}
              <Box sx={{
                px: 2.5, py: 1.25,
                borderBottom: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                background: dark ? alpha('#fff', 0.02) : alpha(semColor(sem), 0.04),
                display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: '16px 16px 0 0',
              }}>
                <SemBadge n={sem} />
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>
                  {grouped[sem].length} μαθήματα
                </Typography>
              </Box>

              {/* Courses */}
              {grouped[sem].map((course, idx) => (
                <Box
                  key={course.id}
                  sx={{
                    px: { xs: 1.5, sm: 2.5 }, py: { xs: 1.4, sm: 1.6 },
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: { xs: 1.5, sm: 2 }, flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    borderBottom: idx < grouped[sem].length - 1 ? '1px solid' : 'none',
                    borderColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    transition: 'background .14s',
                    '&:hover': { background: dark ? alpha('#fff', 0.02) : alpha('#1a73e8', 0.025) },
                    borderRadius: idx === grouped[sem].length - 1 ? '0 0 16px 16px' : 0,
                  }}
                >
                  <Typography sx={{
                    fontWeight: 500, fontSize: { xs: '0.8rem', sm: '0.875rem' },
                    flex: { xs: '1 1 100%', sm: 1 }, minWidth: 0,
                    lineHeight: 1.3
                  }}>
                    {course.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexShrink: 0, ml: { xs: 'auto', sm: 0 } }}>
                    <Tooltip title="Επεξεργασία" disableInteractive>
                      <IconButton size="small" onClick={() => openEdit(course)} sx={{
                        width: 32, height: 32, borderRadius: '9px',
                        background: dark ? alpha('#1a73e8', 0.12) : alpha('#1a73e8', 0.08),
                        color: 'primary.main',
                        '&:hover': { background: dark ? alpha('#1a73e8', 0.2) : alpha('#1a73e8', 0.14) },
                      }}>
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Διαγραφή" disableInteractive>
                      <span>
                        <IconButton size="small" disabled={deleting === course.id} onClick={() => setConfirmDel(course.id)} sx={{
                          width: 32, height: 32, borderRadius: '9px',
                          background: dark ? alpha('#d32f2f', 0.12) : alpha('#d32f2f', 0.08),
                          color: '#d32f2f',
                          '&:hover': { background: dark ? alpha('#d32f2f', 0.2) : alpha('#d32f2f', 0.14) },
                        }}>
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialog.open} onClose={closeDialog} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', background: dark ? '#1e1f23' : '#fff', border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' } }}>
        <DialogTitle sx={{ pt: 2.5, px: 3, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>
            {dialog.course ? 'Επεξεργασία Μαθήματος' : 'Νέο Μάθημα'}
          </Typography>
          <IconButton size="small" onClick={closeDialog} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Όνομα Μαθήματος" fullWidth autoFocus
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            sx={{ mt: 1.0 }}
          />
          <TextField
            label="Εξάμηνο (1–8)" type="number" fullWidth
            value={form.semester}
            onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}
            inputProps={{ min: 1, max: 8 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
          <Button onClick={closeDialog} sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>Ακύρωση</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={<SaveIcon />}
            sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>
            {dialog.course ? 'Αποθήκευση' : 'Προσθήκη'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm delete */}
      <Dialog open={Boolean(confirmDel)} onClose={() => setConfirmDel(null)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '20px', background: dark ? '#1e1f23' : '#fff', border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1rem', pt: 2.5 }}>Διαγραφή Μαθήματος</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            Σίγουρα θέλεις να διαγράψεις αυτό το μάθημα; Τα αρχεία του δεν θα επηρεαστούν.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setConfirmDel(null)} sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>Ακύρωση</Button>
          <Button onClick={handleDelete} color="error" variant="contained" startIcon={<DeleteOutlineIcon />}
            sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCourses;