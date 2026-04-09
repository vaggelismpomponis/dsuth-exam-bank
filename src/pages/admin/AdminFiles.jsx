import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, TextField, InputAdornment, IconButton, Chip, Button,
  Alert, Skeleton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, useTheme, useMediaQuery, alpha, TablePagination,
} from '@mui/material';
import SearchIcon               from '@mui/icons-material/Search';
import FolderOpenIcon           from '@mui/icons-material/FolderOpen';
import HourglassTopIcon         from '@mui/icons-material/HourglassTop';
import CheckCircleOutlineIcon   from '@mui/icons-material/CheckCircleOutline';
import VerifiedIcon             from '@mui/icons-material/Verified';
import DoneIcon                 from '@mui/icons-material/Done';
import DeleteOutlineIcon        from '@mui/icons-material/DeleteOutline';
import VisibilityOutlinedIcon   from '@mui/icons-material/VisibilityOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CalendarTodayIcon        from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon        from '@mui/icons-material/PersonOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import CloseIcon                from '@mui/icons-material/Close';
import RefreshIcon              from '@mui/icons-material/Refresh';

import { supabase }   from '../../supabaseClient';
import { Capacitor }  from '@capacitor/core';
import PdfPreview     from '../../components/PdfPreview';
import FilePreviewDrawer from '../../components/FilePreviewDrawer';

/* ─── Shared helpers ────────────────────────────── */
const cardBase = (dark) => ({
  background:   dark ? alpha('#fff', 0.04) : '#fff',
  border:       '1px solid',
  borderColor:  dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
  borderRadius: '16px',
  boxShadow:    dark ? 'none' : '0 2px 12px rgba(0,0,0,.04)',
});

/* Page header */
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

/* Small round icon button */
const IBtn = ({ title, onClick, href, color = '#1a73e8', icon, disabled, size = 32 }) => {
  const { palette: { mode } } = useTheme();
  const dark = mode === 'dark';
  return (
    <Tooltip title={title} arrow disableInteractive>
      <span>
        <IconButton
          size="small"
          href={href} target={href ? '_blank' : undefined} rel={href ? 'noopener noreferrer' : undefined}
          onClick={!href ? onClick : undefined}
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

/* Status badge */
const StatusBadge = ({ approved }) => (
  <Chip
    icon={approved
      ? <CheckCircleOutlineIcon sx={{ fontSize: '13px !important' }} />
      : <HourglassTopIcon       sx={{ fontSize: '13px !important' }} />}
    label={approved ? 'Εγκεκριμένο' : 'Εκκρεμεί'}
    size="small"
    sx={{
      fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px',
      background:   approved ? alpha('#1e8e3e', 0.12) : alpha('#f57c00', 0.12),
      color:        approved ? '#1e8e3e' : '#f57c00',
      border: '1px solid',
      borderColor:  approved ? alpha('#1e8e3e', 0.25) : alpha('#f57c00', 0.25),
      '& .MuiChip-icon': { color: 'inherit' },
    }}
  />
);

/* ─── Mobile exam card ──────────────────────────── */
const ExamCard = ({ exam, users, onApprove, onPreview, onDelete, approvingId }) => {
  const { palette: { mode } } = useTheme();
  const dark = mode === 'dark';
  return (
    <Box sx={{ ...cardBase(dark), p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, gap: 1 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.3, mb: 0.5 }}>
            {exam.course}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <CalendarTodayIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: '0.73rem', color: 'text.secondary' }}>{exam.year}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: '0.73rem', color: 'text.secondary' }}>{exam.period}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <PersonOutlineIcon sx={{ fontSize: 11, color: 'text.secondary' }} />
              <Typography sx={{ fontSize: '0.73rem', color: 'text.secondary' }}>
                {users[exam.uploader] || 'Άγνωστος'}
              </Typography>
            </Box>
          </Box>
        </Box>
        <StatusBadge approved={exam.approved} />
      </Box>
      <Box sx={{ display: 'flex', gap: 0.75, mt: 1.5 }}>
        {!exam.approved && (
          <IBtn title="Έγκριση" onClick={() => onApprove(exam.id)} color="#1e8e3e"
            disabled={approvingId === exam.id}
            icon={approvingId === exam.id ? <CircularProgress size={13} /> : <DoneIcon sx={{ fontSize: 15 }} />} />
        )}
        <IBtn title="Προβολή"  onClick={() => onPreview(exam)} color="#1a73e8" icon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />} />
        <IBtn title="Λήψη"     href={exam.file_url}            color="#7b1fa2" icon={<FileDownloadOutlinedIcon sx={{ fontSize: 15 }} />} />
        <IBtn title="Διαγραφή" onClick={() => onDelete(exam.id, exam.file_url)} color="#d32f2f" icon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />} />
      </Box>
    </Box>
  );
};

/* ─── Desktop table row ──────────────────────────── */
const COL = 'minmax(220px,1fr) 72px 130px minmax(140px,200px) 110px 148px';
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
    }}>
      {['Μάθημα', 'Έτος', 'Εξεταστική', 'Uploader', 'Status', 'Ενέργειες'].map(h => (
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

const TableRow = ({ exam, users, onApprove, onPreview, onDelete, approvingId, last }) => {
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
    }}>
      <Typography sx={{ fontWeight: 600, fontSize: '0.855rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 2 }}>
        {exam.course}
      </Typography>
      <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{exam.year}</Typography>
      <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary' }}>{exam.period}</Typography>
      <Typography sx={{ fontSize: '0.82rem', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>
        {users[exam.uploader] || '—'}
      </Typography>
      <Box><StatusBadge approved={exam.approved} /></Box>
      <Box sx={{ display: 'flex', gap: 0.6 }}>
        {!exam.approved && (
          <IBtn title="Έγκριση" onClick={() => onApprove(exam.id)} color="#1e8e3e"
            disabled={approvingId === exam.id} size={30}
            icon={approvingId === exam.id ? <CircularProgress size={12} /> : <DoneIcon sx={{ fontSize: 14 }} />} />
        )}
        <IBtn title="Προβολή"  onClick={() => onPreview(exam)} color="#1a73e8" size={30} icon={<VisibilityOutlinedIcon   sx={{ fontSize: 14 }} />} />
        <IBtn title="Λήψη"     href={exam.file_url}            color="#7b1fa2" size={30} icon={<FileDownloadOutlinedIcon sx={{ fontSize: 14 }} />} />
        <IBtn title="Διαγραφή" onClick={() => onDelete(exam.id, exam.file_url)} color="#d32f2f" size={30} icon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />} />
      </Box>
    </Box>
  );
};

/* ─── Main Component ─────────────────────────────── */
const AdminFiles = () => {
  const theme        = useTheme();
  const dark         = theme.palette.mode === 'dark';
  const isMobile     = useMediaQuery(theme.breakpoints.down('md'));

  const [exams,         setExams]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [users,         setUsers]         = useState({});
  const [search,        setSearch]        = useState('');
  const [tab,           setTab]           = useState(0);   // 0=pending 1=approved
  const [page,          setPage]          = useState(0);
  const [rowsPerPage,   setRowsPerPage]   = useState(10);
  const [approvingId,   setApprovingId]   = useState(null);
  const [alert,         setAlert]         = useState({ type: '', msg: '' });
  const [confirmDel,    setConfirmDel]    = useState({ open: false, id: null, url: null });
  const [previewFile,   setPreviewFile]   = useState(null);

  /* fetch */
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    if (!error) setExams(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* resolve uploader names */
  useEffect(() => {
    const ids = [...new Set(exams.map(e => e.uploader).filter(Boolean))];
    if (!ids.length) return;
    supabase.from('profiles').select('id,first_name,last_name,email').in('id', ids).then(({ data }) => {
      if (!data) return;
      const map = {};
      data.forEach(u => {
        map[u.id] = (u.first_name || u.last_name)
          ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim()
          : (u.email ?? u.id);
      });
      setUsers(map);
    });
  }, [exams]);

  const notify = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type: '', msg: '' }), 4000);
  };

  const handleApprove = async (id) => {
    setApprovingId(id);
    const { error } = await supabase.from('exams').update({ approved: true }).eq('id', id);
    if (error) notify('error', error.message);
    else {
      notify('success', 'Εγκρίθηκε επιτυχώς!');
      setPreviewFile(f => f && f.id === id ? { ...f, approved: true } : f);
      await load();
    }
    setApprovingId(null);
  };

  const handleDelete = async () => {
    const { id, url } = confirmDel;
    const path = url?.split('/exams/')?.[1];
    if (path) await supabase.storage.from('exams').remove([path]);
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) notify('error', error.message);
    else { notify('success', 'Διαγράφηκε!'); await load(); }
    setConfirmDel({ open: false, id: null, url: null });
  };

  /* filter */
  const filtered = exams.filter(e => {
    const show = tab === 0 ? !e.approved : e.approved;
    if (!show) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (e.course ?? '').toLowerCase().includes(s)
      || (e.period ?? '').toLowerCase().includes(s)
      || String(e.year ?? '').includes(s);
  });

  const paginated    = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const pendingCount = exams.filter(e => !e.approved).length;
  const approvedCnt  = exams.filter(e =>  e.approved).length;

  const cb = cardBase(dark);

  return (
    <Box>
      <PageHeader
        icon={FolderOpenIcon}
        title="Διαχείριση Αρχείων"
        subtitle="Έγκριση και διαχείριση εξετάσεων"
        badge={loading ? undefined : `${exams.length} αρχεία`}
        action={
          <Tooltip title="Ανανέωση" disableInteractive>
            <IconButton size="small" onClick={load} sx={{ borderRadius: '9px' }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      />

      {alert.msg && (
        <Alert severity={alert.type} sx={{ mb: 2.5, borderRadius: '12px' }} onClose={() => setAlert({ type: '', msg: '' })}>
          {alert.msg}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Αναζήτηση..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0); }}
          size="small"
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 17, color: 'text.secondary' }} /></InputAdornment>,
            sx: { borderRadius: '11px', background: dark ? alpha('#fff', 0.05) : '#fff', fontSize: '0.875rem' },
          }}
          sx={{ width: { xs: '100%', sm: 280 } }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          {[
            { label: `Εκκρεμή (${pendingCount})`,    icon: <HourglassTopIcon />, color: '#f57c00', idx: 0 },
            { label: `Εγκεκριμένα (${approvedCnt})`, icon: <VerifiedIcon />,     color: '#1e8e3e', idx: 1 },
          ].map(({ label, icon, color, idx }) => (
            <Chip
              key={idx}
              icon={React.cloneElement(icon, { sx: { fontSize: '13px !important' } })}
              label={label}
              onClick={() => { setTab(idx); setPage(0); }}
              sx={{
                fontWeight: 700, fontSize: '0.76rem', borderRadius: '9px', cursor: 'pointer',
                background:  tab === idx ? alpha(color, 0.14) : 'transparent',
                border: '1px solid', borderColor: tab === idx ? alpha(color, 0.3) : 'divider',
                color:       tab === idx ? color : 'text.secondary',
                '& .MuiChip-icon': { color: 'inherit' },
                transition: 'all .15s',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[...Array(5)].map((_, i) => (
            <Box key={i} sx={{ ...cb, p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Box sx={{ flex: 1 }}><Skeleton width="45%" height={20} /><Skeleton width="65%" height={15} sx={{ mt: 0.5 }} /></Box>
                <Skeleton width={78} height={24} sx={{ borderRadius: '8px' }} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[...Array(3)].map((_, j) => <Skeleton key={j} variant="rounded" width={30} height={30} sx={{ borderRadius: '9px' }} />)}
              </Box>
            </Box>
          ))}
        </Box>
      ) : paginated.length === 0 ? (
        <Box sx={{ ...cb, py: 9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <FolderOpenIcon sx={{ fontSize: 52, color: 'text.secondary', opacity: 0.25 }} />
          <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {tab === 0 ? 'Δεν υπάρχουν εκκρεμή αρχεία' : 'Δεν υπάρχουν εγκεκριμένα αρχεία'}
          </Typography>
        </Box>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {paginated.map(exam => (
            <ExamCard
              key={exam.id} exam={exam} users={users} approvingId={approvingId}
              onApprove={handleApprove}
              onPreview={exam => setPreviewFile(exam)}
              onDelete={(id, url) => setConfirmDel({ open: true, id, url })}
            />
          ))}
        </Box>
      ) : (
        <Box sx={{ ...cb, overflow: 'hidden' }}>
          <TableHeader />
          {paginated.map((exam, i) => (
            <TableRow
              key={exam.id} exam={exam} users={users} approvingId={approvingId}
              last={i === paginated.length - 1}
              onApprove={handleApprove}
              onPreview={exam => setPreviewFile(exam)}
              onDelete={(id, url) => setConfirmDel({ open: true, id, url })}
            />
          ))}
        </Box>
      )}

      {!loading && filtered.length > 0 && (
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => { setRowsPerPage(+e.target.value); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Ανά σελίδα:"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} από ${count}`}
          sx={{ mt: 0.5 }}
        />
      )}

      {/* Confirm delete */}
      <Dialog open={confirmDel.open} onClose={() => setConfirmDel({ open: false, id: null, url: null })} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: '18px', background: dark ? '#1e1f23' : '#fff', border: '1px solid', borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' } }}>
        <DialogTitle sx={{ fontWeight: 700, pt: 2.5, fontSize: '1rem' }}>Επιβεβαίωση Διαγραφής</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            Είσαι σίγουρος; Το αρχείο θα διαγραφεί οριστικά και δεν θα μπορεί να αποκατασταθεί.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setConfirmDel({ open: false, id: null, url: null })} sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>Ακύρωση</Button>
          <Button onClick={handleDelete} color="error" variant="contained" startIcon={<DeleteOutlineIcon />}
            sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>

      {/* File Preview Drawer */}
      <FilePreviewDrawer
        open={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
        uploader={previewFile ? (users[previewFile.uploader] || '') : ''}
        isAdmin
        approvingId={approvingId}
        onApprove={handleApprove}
        onDelete={(id, url) => { setPreviewFile(null); setConfirmDel({ open: true, id, url }); }}
      />
    </Box>
  );
};

export default AdminFiles;