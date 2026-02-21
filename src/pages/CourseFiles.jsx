import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Skeleton, Stack, Alert, Tooltip, Chip, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useMediaQuery, TextField, MenuItem, Drawer, IconButton, Snackbar } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import ShareIcon from '@mui/icons-material/Share';
import { supabase } from '../supabaseClient';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { downloadFile, shareFile } from '../utils/nativeDownload';

const periods = ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος', 'Επαναληπτική'];

const periodDisplayMap = {
  'Ιανουάριος': 'Ιανουάριος',
  'Ιουνιος': 'Ιούνιος', 'Ιούνιος': 'Ιούνιος',
  'Σεπτέμβριος': 'Σεπτέμβριος', 'Σεπτεμβριος': 'Σεπτέμβριος',
  'Επαναληπτική': 'Επαναληπτική', 'Epanaliptiki': 'Επαναληπτική',
  'Xeimerino': 'Ιανουάριος', 'Χειμερινό': 'Ιανουάριος',
  'Earino': 'Ιούνιος', 'Εαρινό': 'Ιούνιος',
  'September': 'Σεπτέμβριος', 'Septemvrios': 'Σεπτέμβριος',
};
const toDisplayPeriod = (value) => periodDisplayMap[value] || value;

const CourseFiles = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploaders, setUploaders] = useState({});
  const [downloadingAll, setDownloadingAll] = useState(false);
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery('(max-width:899px)');
  const [yearFilter, setYearFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:599px)');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showNotification = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const yearOptions = Array.from(new Set(files.map(f => f.year))).sort((a, b) => b - a);

  const filteredFiles = files.filter(f => {
    const displayPeriod = toDisplayPeriod(f.period);
    return (
      (!yearFilter || String(f.year) === String(yearFilter)) &&
      (!periodFilter || displayPeriod === periodFilter)
    );
  });

  const getPeriodIndex = (p) => { const idx = periods.indexOf(toDisplayPeriod(p)); return idx === -1 ? Number.MAX_SAFE_INTEGER : idx; };
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return getPeriodIndex(a.period) - getPeriodIndex(b.period);
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await supabase.auth.getSession();
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        setProfile(profileData);
        setIsAdmin(profileData?.role === 'admin');
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError('');
      const { data: courseData, error: courseError } = await supabase.from('courses').select('*').eq('id', id).single();
      if (courseError) { setError('Σφάλμα ανάκτησης μαθήματος'); setLoading(false); return; }
      setCourse(courseData);
      let query = supabase.from('exams').select('*').eq('course', courseData.name).order('created_at', { ascending: false });
      if (!user || !isAdmin) query = query.eq('approved', true);
      const { data: filesData, error: filesError } = await query;
      if (filesError) { setError('Σφάλμα ανάκτησης αρχείων'); setLoading(false); return; }
      setFiles(filesData);
      const uploaderIds = [...new Set((filesData || []).map(f => f.uploader).filter(Boolean))];
      if (uploaderIds.length > 0) {
        const { data: uploaderProfiles } = await supabase.from('profiles').select('id,first_name,last_name,email').in('id', uploaderIds);
        if (uploaderProfiles) {
          const map = {};
          uploaderProfiles.forEach(u => {
            map[u.id] = (u.first_name || u.last_name) ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : (u.email || u.id);
          });
          setUploaders(map);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  useEffect(() => { if (!loading) window.scrollTo(0, 0); }, [loading]);

  const handleApprove = async (fileId) => {
    setError(''); setSuccess('');
    const { error } = await supabase.from('exams').update({ approved: true }).eq('id', fileId);
    if (error) setError('Σφάλμα έγκρισης: ' + error.message);
    else { setSuccess('Εγκρίθηκε!'); setFiles(files => files.map(f => f.id === fileId ? { ...f, approved: true } : f)); }
  };

  const handleDelete = async (fileId, file_url) => {
    setError(''); setSuccess('');
    const filePath = file_url.split('/exams/')[1];
    if (filePath) await supabase.storage.from('exams').remove([filePath]);
    const { error } = await supabase.from('exams').delete().eq('id', fileId);
    if (error) setError('Σφάλμα διαγραφής: ' + error.message);
    else { setSuccess('Διαγράφηκε!'); setFiles(files => files.filter(f => f.id !== fileId)); }
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    const zip = new JSZip();
    await Promise.all(files.map(async (file) => {
      try {
        const response = await fetch(file.file_url);
        const blob = await response.blob();
        zip.file(getFilenameFromUrl(file.file_url), blob);
      } catch (e) { }
    }));
    const content = await zip.generateAsync({ type: 'blob' });
    await downloadFile(content, `DSUth_Mathima_${course?.name || 'files'}.zip`);
    setDownloadingAll(false);
  };

  const getCleanUrl = url => (url ? url.trim().replace(/\?$/, '') : '');
  const getFilenameFromUrl = (url) => url.split('/').pop().split('?')[0];

  const handleDownload = async (url) => {
    const filename = getFilenameFromUrl(url);
    try {
      showNotification('Γίνεται λήψη...', 'info');
      await downloadFile(url, filename);
      showNotification('Αρχείο αποθηκεύτηκε στα Έγγραφα!', 'success');
    } catch (e) { showNotification('Αποτυχία λήψης αρχείου!', 'error'); }
  };

  const handleShare = async (url) => {
    const filename = getFilenameFromUrl(url);
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      await shareFile(blob, filename);
    } catch (e) { showNotification('Αποτυχία κοινοποίησης αρχείου!', 'error'); }
  };

  /* ── Filter Controls Component ── */
  const FilterControls = ({ direction = 'row' }) => (
    <Stack direction={direction} spacing={2} sx={{ mb: direction === 'column' ? 0 : 2 }}>
      <TextField label="Έτος" select size="small" fullWidth value={yearFilter} onChange={e => setYearFilter(e.target.value)} sx={{ maxWidth: direction === 'row' ? 160 : 'none' }}>
        <MenuItem value="">Όλα τα έτη</MenuItem>
        {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
      </TextField>
      <TextField label="Εξεταστική" select size="small" fullWidth value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} sx={{ maxWidth: direction === 'row' ? 190 : 'none' }}>
        <MenuItem value="">Όλες</MenuItem>
        {periods.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
      </TextField>
    </Stack>
  );

  const handleView = (file) => {
    const url = getCleanUrl(file.file_url);
    const params = new URLSearchParams({
      url,
      name: getFilenameFromUrl(url),
      course: course?.name || '',
      period: toDisplayPeriod(file.period) || '',
      year: String(file.year || ''),
    });
    navigate(`/viewer?${params.toString()}`);
  };

  const ActionButtons = ({ file }) => (
    <Stack direction="row" spacing={0.5}>
      <Tooltip title="Προβολή">
        <IconButton size="small" onClick={() => handleView(file)} sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:hover': { bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'rgba(255,255,255,0.08)', color: 'primary.main' } }}>
          <VisibilityIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Λήψη">
        <IconButton size="small" onClick={() => handleDownload(getCleanUrl(file.file_url))} sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:hover': { bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'rgba(255,255,255,0.08)', color: 'primary.main' } }}>
          <DownloadIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Κοινοποίηση">
        <IconButton size="small" onClick={() => handleShare(getCleanUrl(file.file_url))} sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:hover': { bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'rgba(255,255,255,0.08)', color: 'primary.main' } }}>
          <ShareIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
      {user && isAdmin && !file.approved && (
        <Tooltip title="Έγκριση">
          <IconButton size="small" onClick={() => handleApprove(file.id)} sx={{ color: 'success.main', border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:hover': { bgcolor: theme.palette.mode === 'light' ? '#e6f4ea' : 'rgba(46,125,50,0.15)' } }}>
            <CheckIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
      {user && isAdmin && (
        <Tooltip title="Διαγραφή">
          <IconButton size="small" onClick={() => handleDelete(file.id, file.file_url)} sx={{ color: 'error.main', border: '1px solid', borderColor: 'divider', borderRadius: 2, '&:hover': { bgcolor: theme.palette.mode === 'light' ? '#fce8e6' : 'rgba(211,47,47,0.15)' } }}>
            <DeleteIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 2, md: 5 }, pb: { xs: 12, md: 5 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
        <IconButton
          onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign('/courses')}
          sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
        {course && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>
              {course.name}
            </Typography>
            <Chip label={`Εξάμηνο ${course.semester}`} size="small" sx={{ mt: 0.5, bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'rgba(138,180,248,0.15)', color: 'primary.main', fontWeight: 600 }} />
          </Box>
        )}
      </Box>

      {/* Actions row */}
      <Stack direction="row" spacing={1} sx={{ my: 2.5 }}>
        <Button
          variant="outlined"
          startIcon={<FolderZipIcon />}
          onClick={handleDownloadAll}
          disabled={files.length === 0 || downloadingAll}
          size="small"
        >
          {downloadingAll ? 'Δημιουργία...' : 'Λήψη zip'}
        </Button>
        {isMobile && (
          <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setFilterDrawerOpen(true)} size="small">
            Φίλτρα
          </Button>
        )}
      </Stack>

      {/* Filters */}
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          PaperProps={{ sx: { borderRadius: '20px 20px 0 0', p: 3 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Φίλτρα</Typography>
            <IconButton onClick={() => setFilterDrawerOpen(false)}><CloseIcon /></IconButton>
          </Box>
          <FilterControls direction="column" />
        </Drawer>
      ) : (
        <FilterControls />
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {loading ? (
        <Stack spacing={2}>{[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={72} />)}</Stack>
      ) : sortedFiles.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <SentimentDissatisfiedIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>Δεν βρέθηκαν αρχεία.</Typography>
        </Box>
      ) : isMobileOrTablet ? (
        /* Mobile Card View */
        <Stack spacing={1.5}>
          {sortedFiles.map(file => (
            <Paper key={file.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'rgba(138,180,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <DescriptionIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{file.year} — {toDisplayPeriod(file.period)}</Typography>
                  <Chip
                    label={file.approved ? 'Εγκεκριμένο' : 'Αναμονή'}
                    size="small"
                    sx={{
                      mt: 0.5,
                      bgcolor: file.approved
                        ? (theme.palette.mode === 'light' ? '#e6f4ea' : 'rgba(46,125,50,0.2)')
                        : (theme.palette.mode === 'light' ? '#fef7e0' : 'rgba(227,116,0,0.2)'),
                      color: file.approved
                        ? (theme.palette.mode === 'light' ? '#1e8e3e' : '#81c784')
                        : (theme.palette.mode === 'light' ? '#e37400' : '#ffb74d'),
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
              </Stack>
              <ActionButtons file={file} />
            </Paper>
          ))}
        </Stack>
      ) : (
        /* Desktop Table View */
        <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.mode === 'light' ? '#f8fafb' : 'rgba(255,255,255,0.03)' }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', width: 50 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Έτος</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Εξεταστική</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Κατάσταση</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Ενέργειες</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedFiles.map((file, idx) => (
                <TableRow key={file.id} sx={{ '&:hover': { bgcolor: theme.palette.mode === 'light' ? '#f8fafb' : 'rgba(255,255,255,0.03)' } }}>
                  <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{file.year}</TableCell>
                  <TableCell>{toDisplayPeriod(file.period)}</TableCell>
                  <TableCell>
                    <Chip
                      label={file.approved ? 'Εγκεκριμένο' : 'Αναμονή'}
                      size="small"
                      sx={{
                        bgcolor: file.approved
                          ? (theme.palette.mode === 'light' ? '#e6f4ea' : 'rgba(46,125,50,0.2)')
                          : (theme.palette.mode === 'light' ? '#fef7e0' : 'rgba(227,116,0,0.2)'),
                        color: file.approved
                          ? (theme.palette.mode === 'light' ? '#1e8e3e' : '#81c784')
                          : (theme.palette.mode === 'light' ? '#e37400' : '#ffb74d'),
                        fontWeight: 600,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <ActionButtons file={file} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 8 }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ borderRadius: 3, fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CourseFiles;