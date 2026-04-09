import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, IconButton, Button,
  Alert, Skeleton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  useTheme, useMediaQuery, alpha, Chip, Stack,
} from '@mui/material';
import SearchIcon       from '@mui/icons-material/Search';
import MenuBookIcon     from '@mui/icons-material/MenuBook';
import AddIcon          from '@mui/icons-material/Add';
import EditIcon         from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon         from '@mui/icons-material/Save';
import CloseIcon        from '@mui/icons-material/Close';
import RefreshIcon      from '@mui/icons-material/Refresh';
import SchoolIcon       from '@mui/icons-material/School';
import { supabase } from '../../supabaseClient';

/* ─── Shared card style ─── */
const cardBase = (dark) => ({
  background:   dark ? alpha('#fff', 0.04) : '#fff',
  border:       '1px solid',
  borderColor:  dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
  borderRadius: '16px',
  boxShadow:    dark ? 'none' : '0 2px 12px rgba(0,0,0,.04)',
});

/* ─── Page header (same as AdminFiles) ─── */
const PageHeader = ({ icon: Icon, title, subtitle, badge, action }) => {
  const { palette: { mode } } = useTheme();
  const dark = mode === 'dark';
  return (
    <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: '13px',
          background: 'linear-gradient(135deg,#1a73e8,#0052cc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(26,115,232,.35)',
        }}>
          <Icon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: '1.35rem', sm: '1.7rem' } }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2, fontSize: '0.82rem' }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {badge != null && (
          <Chip label={badge} size="small" sx={{
            fontWeight: 700, fontSize: '0.75rem', borderRadius: '9px',
            background: dark ? alpha('#1a73e8', 0.15) : alpha('#1a73e8', 0.1),
            color: 'primary.main', border: '1px solid', borderColor: alpha('#1a73e8', 0.2),
          }} />
        )}
        {action}
      </Box>
    </Box>
  );
};

/* ─── Small icon button (same as AdminFiles) ─── */
const IBtn = ({ title, onClick, color = '#1a73e8', icon, disabled, size = 32 }) => {
  const { palette: { mode } } = useTheme();
  const dark = mode === 'dark';
  return (
    <Tooltip title={title} arrow disableInteractive>
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          disabled={disabled}
          sx={{
            width: size, height: size, borderRadius: '9px',
            background: dark ? alpha(color, 0.14) : alpha(color, 0.09),
            color,
            transition: 'all 0.16s ease',
            '&:hover': { background: dark ? alpha(color, 0.24) : alpha(color, 0.16), transform: 'scale(1.08)' },
            '&:disabled': { opacity: 0.35 },
          }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
};

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

/* ─── Mobile course card ─── */
const CourseCard = ({ course, onEdit, onDelete }) => {
  const { palette: { mode } } = useTheme();
  const dark = mode === 'dark';
  return (
    <Box sx={{
      ...cardBase(dark), p: 2.25,
      transition: 'box-shadow .2s',
      '&:hover': { boxShadow: dark ? '0 4px 20px rgba(0,0,0,.28)' : '0 4px 18px rgba(0,0,0,.08)' },
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3, mb: 0.75 }}>
            {course.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <SchoolIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
            <Typography sx={{ fontSize: '0.73rem', color: 'text.secondary' }}>
              {course.semester}ο Εξάμηνο
            </Typography>
          </Box>
        </Box>
        <SemBadge n={course.semester} />
      </Box>
      <Box sx={{ display: 'flex', gap: 0.75, mt: 1.5 }}>
        <IBtn title="Επεξεργασία" onClick={() => onEdit(course)} color="#1a73e8" icon={<EditIcon sx={{ fontSize: 15 }} />} />
        <IBtn title="Διαγραφή" onClick={() => onDelete(course.id)} color="#d32f2f" icon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />} />
      </Box>
    </Box>
  );
};

/* ─── Desktop table header ─── */
const COL = 'minmax(200px,1fr) 100px 120px';
const TableHeader = () => {
  const { palette: { mode } } = useTheme();
  const dark = mode === 'dark';
  return (
    <Box sx={{
      display: 'grid', gridTemplateColumns: COL,
      px: 3, py: 1.4,
      background: dark ? alpha('#fff', 0.028) : alpha('#1a73e8', 0.04),
      borderBottom: '1px solid',
      borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      borderRadius: '16px 16px 0 0',
    }}>
      {['Μάθημα', 'Εξάμηνο', 'Ενέργειες'].map(h => (
        <Typography key={h} sx={{
          fontWeight: 700, fontSize: '0.68rem', color: 'text.secondary',
          textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          {h}
        </Typography>
      ))}
    </Box>
  );
};

const TableRow = ({ course, onEdit, onDelete, last }) => {
  const { palette: { mode } } = useTheme();
  const dark = mode === 'dark';
  return (
    <Box sx={{
      display: 'grid', gridTemplateColumns: COL,
      px: 3, py: 1.75, alignItems: 'center',
      borderBottom: last ? 'none' : '1px solid',
      borderColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
      transition: 'background 0.14s',
      '&:hover': { background: dark ? alpha('#fff', 0.02) : alpha('#1a73e8', 0.025) },
      borderRadius: last ? '0 0 16px 16px' : 0,
    }}>
      <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 2 }}>
        {course.name}
      </Typography>
      <Box>
        <SemBadge n={course.semester} />
      </Box>
      <Box sx={{ display: 'flex', gap: 0.6 }}>
        <IBtn title="Επεξεργασία" onClick={() => onEdit(course)} color="#1a73e8" size={30} icon={<EditIcon sx={{ fontSize: 14 }} />} />
        <IBtn title="Διαγραφή" onClick={() => onDelete(course.id)} color="#d32f2f" size={30} icon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />} />
      </Box>
    </Box>
  );
};

/* ─── Main ─── */
const AdminCourses = () => {
  const theme    = useTheme();
  const dark     = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [saving,     setSaving]     = useState(false);
  const [alert,      setAlert]      = useState({ type: '', msg: '' });
  const [dialog,     setDialog]     = useState({ open: false, course: null });
  const [confirmDel, setConfirmDel] = useState(null);
  const [form,       setForm]       = useState({ name: '', semester: 1 });

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

  const openAdd  = () => { setDialog({ open: true, course: null }); setForm({ name: '', semester: 1 }); };
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
    const { error } = await supabase.from('courses').delete().eq('id', confirmDel);
    if (error) notify('error', error.message);
    else { notify('success', 'Το μάθημα διαγράφηκε!'); load(); }
    setConfirmDel(null);
  };

  const filtered = courses.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  /* group by semester for desktop */
  const grouped   = filtered.reduce((acc, c) => { const s = c.semester; if (!acc[s]) acc[s] = []; acc[s].push(c); return acc; }, {});
  const semesters = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  const cb = cardBase(dark);

  return (
    <Box>
      <PageHeader
        icon={MenuBookIcon}
        title="Διαχείριση Μαθημάτων"
        subtitle="Μαθήματα και διαχείριση εξαμήνων"
        badge={loading ? undefined : `${courses.length} μαθήματα`}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
        }
      />

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
        /* Skeleton */
        isMobile ? (
          <Stack spacing={1.5}>
            {[...Array(4)].map((_, i) => (
              <Box key={i} sx={{ ...cb, p: 2.25 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Box sx={{ flex: 1 }}>
                    <Skeleton width="55%" height={20} />
                    <Skeleton width="30%" height={15} sx={{ mt: 0.5 }} />
                  </Box>
                  <Skeleton width={52} height={22} sx={{ borderRadius: '7px' }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '9px' }} />
                  <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: '9px' }} />
                </Box>
              </Box>
            ))}
          </Stack>
        ) : (
          <Stack spacing={2}>
            {[...Array(3)].map((_, i) => (
              <Box key={i} sx={cb}>
                <Box sx={{ px: 3, py: 1.4, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Skeleton width={90} height={18} />
                </Box>
                {[...Array(3)].map((_, j) => (
                  <Box key={j} sx={{ display: 'grid', gridTemplateColumns: COL, px: 3, py: 1.75, alignItems: 'center', borderBottom: j < 2 ? '1px solid' : 'none', borderColor: 'divider' }}>
                    <Skeleton width="60%" height={18} />
                    <Skeleton width={52} height={22} sx={{ borderRadius: '7px' }} />
                    <Box sx={{ display: 'flex', gap: 0.6 }}>
                      <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: '9px' }} />
                      <Skeleton variant="rounded" width={30} height={30} sx={{ borderRadius: '9px' }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            ))}
          </Stack>
        )
      ) : filtered.length === 0 ? (
        <Box sx={{ ...cb, py: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <MenuBookIcon sx={{ fontSize: 52, color: 'text.secondary', opacity: 0.25 }} />
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>Δεν βρέθηκαν μαθήματα</Typography>
          <Button startIcon={<AddIcon />} onClick={openAdd} sx={{ mt: 0.5, borderRadius: '10px', textTransform: 'none' }}>
            Προσθήκη πρώτου μαθήματος
          </Button>
        </Box>
      ) : isMobile ? (
        /* Mobile: flat card list, sorted by semester */
        <Stack spacing={1.5}>
          {filtered.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={openEdit}
              onDelete={setConfirmDel}
            />
          ))}
        </Stack>
      ) : (
        /* Desktop: grouped by semester with table rows */
        <Stack spacing={2}>
          {semesters.map(sem => (
            <Box key={sem} sx={{ ...cb, overflow: 'hidden' }}>
              {/* Semester heading row */}
              <Box sx={{
                px: 3, py: 1.25,
                borderBottom: '1px solid',
                borderColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                background: dark ? alpha('#fff', 0.02) : alpha(semColor(sem), 0.04),
                display: 'flex', alignItems: 'center', gap: 1.5,
              }}>
                <SemBadge n={sem} />
                <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', fontWeight: 600 }}>
                  {grouped[sem].length} μαθήματα
                </Typography>
              </Box>
              {/* Column header only on first sem group? No — inline */}
              <Box sx={{
                display: 'grid', gridTemplateColumns: COL,
                px: 3, py: 1,
                background: dark ? alpha('#fff', 0.015) : alpha('#1a73e8', 0.025),
                borderBottom: '1px solid',
                borderColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              }}>
                {['Μάθημα', 'Εξάμηνο', 'Ενέργειες'].map(h => (
                  <Typography key={h} sx={{
                    fontWeight: 700, fontSize: '0.63rem', color: 'text.secondary',
                    textTransform: 'uppercase', letterSpacing: '0.07em',
                  }}>
                    {h}
                  </Typography>
                ))}
              </Box>
              {grouped[sem].map((course, idx) => (
                <TableRow
                  key={course.id}
                  course={course}
                  last={idx === grouped[sem].length - 1}
                  onEdit={openEdit}
                  onDelete={setConfirmDel}
                />
              ))}
            </Box>
          ))}
        </Stack>
      )}

      {/* Add / Edit dialog */}
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
        <DialogTitle sx={{ pt: 2.5, px: 3, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>Διαγραφή Μαθήματος</Typography>
          <IconButton size="small" onClick={() => setConfirmDel(null)} sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Σίγουρα θέλεις να διαγράψεις αυτό το μάθημα; Τα αρχεία του δεν θα επηρεαστούν.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
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