import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Typography, Box, Button, Skeleton, Stack, Alert, Tooltip,
  Chip, useTheme, useMediaQuery, TextField, MenuItem, Drawer, IconButton,
  Snackbar, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FolderZipRoundedIcon from '@mui/icons-material/FolderZipRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { supabase } from '../supabaseClient';
import { cachedQuery, invalidateCacheByPrefix } from '../lib/queryCache';
import { withStaticFallback } from '../lib/staticData';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { downloadFile, shareFile } from '../utils/nativeDownload';
import FilePreviewDrawer from '../components/FilePreviewDrawer';
import { trackEvent } from '../lib/analytics';

/* ── Semester accent palette (mirrors Courses.jsx) ── */
const SEMESTER_PALETTE = [
  '#1a73e8', '#0f9d58', '#e37400', '#d93025',
  '#7b1fa2', '#00897b', '#c62828', '#1565c0',
];

const PERIOD_ICONS = {
  'Ιανουάριος': '❄️',
  'Ιούνιος': '☀️',
  'Σεπτέμβριος': '🍂',
  'Επαναληπτική': '🔄',
};

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
  const isDark = theme.palette.mode === 'dark';
  const isMobile = useMediaQuery('(max-width:599px)');
  const [yearFilter, setYearFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const showNotification = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const [previewFile, setPreviewFile] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  /* ── Derived ── */
  const semColor = course ? SEMESTER_PALETTE[(course.semester - 1) % SEMESTER_PALETTE.length] : '#1a73e8';
  const yearOptions = Array.from(new Set(files.map(f => f.year))).sort((a, b) => b - a);
  const activeFilters = (yearFilter ? 1 : 0) + (periodFilter ? 1 : 0);

  const filteredFiles = files.filter(f => {
    const displayPeriod = toDisplayPeriod(f.period);
    return (
      (!yearFilter || String(f.year) === String(yearFilter)) &&
      (!periodFilter || displayPeriod === periodFilter)
    );
  });

  const getPeriodIndex = (p) => { const idx = periods.indexOf(toDisplayPeriod(p)); return idx === -1 ? Number.MAX_SAFE_INTEGER : idx; };
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return getPeriodIndex(a.period) - getPeriodIndex(b.period);
  });

  /* ── Data fetching ── */
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

      // Course details — 15-minute TTL (course metadata almost never changes)
      let courseData;
      try {
        courseData = await cachedQuery(
          `course:${id}`,
          async () => {
            const { data, error } = await supabase
              .from('courses').select('*').eq('id', id).single();
            if (error) throw error;
            return data;
          },
          15 * 60 * 1000
        );
      } catch {
        setError('Σφάλμα ανάκτησης μαθήματος'); setLoading(false); return;
      }
      setCourse(courseData);

      // Exams list:
      //   - Admins always get live data (they must see pending/unapproved files)
      //   - Regular users: try static CDN JSON first, then browser cache, then live Supabase
      let filesData;
      try {
        filesData = await cachedQuery(
          isAdmin ? null : `exams:course:${id}`,
          isAdmin
            ? async () => {
                let query = supabase
                  .from('exams')
                  .select('*')
                  .eq('course', courseData.name)
                  .order('created_at', { ascending: false });
                const { data, error } = await query;
                if (error) throw error;
                return data ?? [];
              }
            : () => withStaticFallback(
                `/data/exams-${id}.json`,
                async () => {
                  const { data, error } = await supabase
                    .from('exams')
                    .select('*')
                    .eq('course', courseData.name)
                    .eq('approved', true)
                    .order('created_at', { ascending: false });
                  if (error) throw error;
                  return data ?? [];
                }
              ),
          5 * 60 * 1000
        );
      } catch {
        setError('Σφάλμα ανάκτησης αρχείων'); setLoading(false); return;
      }
      setFiles(filesData);

      // Uploader profile names — 30-minute TTL (names basically never change)
      const uploaderIds = [...new Set((filesData || []).map(f => f.uploader).filter(Boolean))];
      if (uploaderIds.length > 0) {
        const cacheKey = `profiles:uploaders:${uploaderIds.slice().sort().join(',')}`;
        const uploaderProfiles = await cachedQuery(
          cacheKey,
          async () => {
            const { data } = await supabase
              .from('profiles')
              .select('id,first_name,last_name,email')
              .in('id', uploaderIds);
            return data ?? [];
          },
          30 * 60 * 1000
        );
        const map = {};
        uploaderProfiles.forEach(u => {
          map[u.id] = (u.first_name || u.last_name)
            ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
            : (u.email || u.id);
        });
        setUploaders(map);
      }

      setLoading(false);
    };
    fetchData();
  }, [id, user, isAdmin]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);
  useEffect(() => { if (!loading) window.scrollTo(0, 0); }, [loading]);

  /* ── Actions ── */
  const handleApprove = async (fileId) => {
    setError(''); setSuccess('');
    const { error } = await supabase.from('exams').update({ approved: true }).eq('id', fileId);
    if (error) setError('Σφάλμα έγκρισης: ' + error.message);
    else {
      setSuccess('Εγκρίθηκε!');
      setFiles(files => files.map(f => f.id === fileId ? { ...f, approved: true } : f));
      // Bust the cached exam list and counts so other users see the newly approved file
      invalidateCacheByPrefix(`exams:course:${id}`);
      invalidateCacheByPrefix('exams:counts');
      invalidateCacheByPrefix('home:recent-exams');
    }
  };

  const handleDelete = async (fileId, file_url) => {
    setError(''); setSuccess('');
    const filePath = file_url.split('/exams/')[1];
    if (filePath) await supabase.storage.from('exams').remove([filePath]);
    const { error } = await supabase.from('exams').delete().eq('id', fileId);
    if (error) setError('Σφάλμα διαγραφής: ' + error.message);
    else {
      setSuccess('Διαγράφηκε!');
      setFiles(files => files.filter(f => f.id !== fileId));
      // Bust the cached exam list and counts so deletions propagate to other users
      invalidateCacheByPrefix(`exams:course:${id}`);
      invalidateCacheByPrefix('exams:counts');
      invalidateCacheByPrefix('home:recent-exams');
    }
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
    
    // Log bulk ZIP download
    trackEvent('download_all', { courseId: id, filesCount: files.length });
  };

  const getCleanUrl = url => (url ? url.trim().replace(/\?$/, '') : '');
  const getFilenameFromUrl = (url) => url.split('/').pop().split('?')[0];

  const handleDownload = async (file) => {
    const url = getCleanUrl(file.file_url);
    const filename = getFilenameFromUrl(url);
    try {
      showNotification('Γίνεται λήψη...', 'info');
      await downloadFile(url, filename);
      showNotification('Αρχείο αποθηκεύτηκε στα Έγγραφα!', 'success');
      // Log single download
      trackEvent('download', { courseId: id, examId: file.id, filename });
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

  const handleDeleteConfirmed = async () => {
    if (!confirmDel) return;
    await handleDelete(confirmDel.id, confirmDel.file_url);
    setConfirmDel(null);
  };

  const handleBack = () => window.history.length > 1 ? window.history.back() : window.location.assign('/courses');

  /* ── Filter Drawer contents ── */
  const FilterFields = ({ direction = 'row' }) => (
    <Stack direction={direction} spacing={1.5}>
      <TextField
        label="Έτος" select size="small" fullWidth
        value={yearFilter} onChange={e => setYearFilter(e.target.value)}
        sx={{ minWidth: direction === 'row' ? 130 : 'none' }}
      >
        <MenuItem value="">Όλα τα έτη</MenuItem>
        {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
      </TextField>
      <TextField
        label="Εξεταστική" select size="small" fullWidth
        value={periodFilter} onChange={e => setPeriodFilter(e.target.value)}
        sx={{ minWidth: direction === 'row' ? 160 : 'none' }}
      >
        <MenuItem value="">Όλες</MenuItem>
        {periods.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
      </TextField>
    </Stack>
  );

  /* ── Helpers ── */
  const heroGradient = isDark
    ? `linear-gradient(135deg, #1e2a3a 0%, #1e2230 100%)`
    : `linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 60%, #e8f4ea 100%)`;

  return (
    <Box sx={{ minHeight: '100vh' }}>

      {/* ── Hero Header ── */}
      <Box sx={{
        background: heroGradient,
        borderBottom: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : `${semColor}18`,
        pt: { xs: 4, md: 6 },
        pb: { xs: 3.5, md: 5 },
        px: 2,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <Box sx={{
          position: 'absolute', top: -50, right: -50, width: 200, height: 200,
          borderRadius: '50%', background: `${semColor}12`, pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -30, left: '25%', width: 140, height: 140,
          borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.03)' : `${semColor}08`,
          pointerEvents: 'none',
        }} />

        <Container maxWidth="md" sx={{ position: 'relative' }}>
          {/* Back button */}
          <Box
            onClick={handleBack}
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.8,
              mb: 2.5, cursor: 'pointer',
              color: 'text.secondary',
              fontSize: '0.82rem', fontWeight: 600,
              transition: 'color 0.15s',
              '&:hover': { color: semColor },
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
            Μαθήματα
          </Box>

          {/* Course icon + title */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{
              width: 52, height: 52, borderRadius: '16px', flexShrink: 0,
              background: `linear-gradient(135deg, ${semColor}ee, ${semColor}aa)`,
              boxShadow: `0 8px 24px ${semColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mt: 0.3,
            }}>
              <SchoolRoundedIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Box>
              {loading ? (
                <Skeleton width={280} height={36} />
              ) : (
                <>
                  <Typography variant="h4" sx={{
                    fontWeight: 900, letterSpacing: '-0.03em',
                    color: 'text.primary',
                    fontSize: { xs: '1.5rem', md: '2rem' },
                    lineHeight: 1.2, mb: 0.75,
                  }}>
                    {course?.name}
                  </Typography>

                  {/* Meta chips */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {course && (
                      <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.7,
                        px: 1.5, py: 0.5, borderRadius: '100px',
                        bgcolor: `${semColor}18`,
                        border: '1px solid', borderColor: `${semColor}35`,
                      }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: semColor, boxShadow: `0 0 5px ${semColor}80` }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: semColor }}>
                          {course.semester}ο Εξάμηνο
                        </Typography>
                      </Box>
                    )}
                    {!loading && (
                      <Box sx={{
                        display: 'inline-flex', alignItems: 'center', gap: 0.7,
                        px: 1.5, py: 0.5, borderRadius: '100px',
                        bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                        border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
                      }}>
                        <DescriptionRoundedIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary' }}>
                          {files.length} {files.length === 1 ? 'αρχείο' : 'αρχεία'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Body ── */}
      <Container maxWidth="md" sx={{ pt: 3.5, pb: { xs: 12, md: 8 } }}>

        {/* ── Alerts ── */}
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '14px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '14px' }}>{success}</Alert>}

        {/* ── Sticky toolbar: actions + filters ── */}
        <Box sx={{
          position: 'sticky', top: { xs: 56, md: 64 }, zIndex: 10,
          pt: 1.5, pb: 1,
          mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 },
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          bgcolor: isDark ? 'rgba(22,23,26,0.85)' : 'rgba(248,250,251,0.88)',
          mb: 3,
        }}>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            flexWrap: { xs: 'wrap', sm: 'nowrap' },
          }}>
            {/* Download zip */}
            <Button
              variant="outlined"
              startIcon={<FolderZipRoundedIcon />}
              onClick={handleDownloadAll}
              disabled={files.length === 0 || downloadingAll}
              size="small"
              sx={{
                borderRadius: '100px', fontWeight: 700, fontSize: '0.78rem',
                flexShrink: 0,
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                color: 'text.secondary',
                '&:hover': { borderColor: semColor, color: semColor, bgcolor: `${semColor}0a` },
              }}
            >
              {downloadingAll ? 'Δημιουργία...' : 'Λήψη ZIP'}
            </Button>

            {/* Filters — inline on desktop, drawer trigger on mobile */}
            {isMobile ? (
              <Button
                variant="outlined"
                startIcon={<FilterListRoundedIcon />}
                onClick={() => setFilterDrawerOpen(true)}
                size="small"
                sx={{
                  borderRadius: '100px', fontWeight: 700, fontSize: '0.78rem',
                  borderColor: activeFilters > 0 ? semColor : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                  color: activeFilters > 0 ? semColor : 'text.secondary',
                  bgcolor: activeFilters > 0 ? `${semColor}0d` : 'transparent',
                }}
              >
                Φίλτρα{activeFilters > 0 ? ` (${activeFilters})` : ''}
              </Button>
            ) : (
              <Box sx={{ flex: 1, display: 'flex', gap: 1 }}>
                <FilterFields />
                {activeFilters > 0 && (
                  <Button
                    size="small"
                    onClick={() => { setYearFilter(''); setPeriodFilter(''); }}
                    sx={{ borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap' }}
                  >
                    Καθαρισμός
                  </Button>
                )}
              </Box>
            )}

            {/* Result count */}
            {!loading && (
              <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', fontWeight: 600, flexShrink: 0, ml: 'auto' }}>
                {sortedFiles.length} αποτελέσματα
              </Typography>
            )}
          </Box>
        </Box>

        {/* ── Files list ── */}
        {loading ? (
          <Stack spacing={1.5}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rounded" height={78} sx={{ borderRadius: '16px' }} />
            ))}
          </Stack>
        ) : sortedFiles.length === 0 ? (
          <Box sx={{
            textAlign: 'center', py: 10, px: 3,
            border: '2px dashed', borderColor: 'divider', borderRadius: '24px',
          }}>
            <SentimentDissatisfiedRoundedIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 2, opacity: 0.6 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
              Δεν βρέθηκαν αρχεία.
            </Typography>
            {activeFilters > 0 && (
              <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
                Δοκιμάστε διαφορετικά φίλτρα
              </Typography>
            )}
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {sortedFiles.map((file, idx) => (
              <FileCard
                key={file.id}
                file={file}
                idx={idx}
                semColor={semColor}
                isDark={isDark}
                isAdmin={isAdmin}
                user={user}
                course={course}
                 onPreview={() => {
                   setPreviewFile({ ...file, period: toDisplayPeriod(file.period), course: course?.name, courseId: course?.id });
                   trackEvent('preview', { courseId: id, examId: file.id });
                 }}
                 onDownload={() => handleDownload(file)}
                onShare={() => handleShare(getCleanUrl(file.file_url))}
                onApprove={() => handleApprove(file.id)}
                onDelete={() => setConfirmDel(file)}
                toDisplayPeriod={toDisplayPeriod}
              />
            ))}
          </Stack>
        )}
      </Container>

      {/* ── Mobile filter drawer ── */}
      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{ sx: { borderRadius: '24px 24px 0 0', p: 3, pb: 4 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>Φίλτρα</Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>
        <FilterFields direction="column" />
        {activeFilters > 0 && (
          <Button
            fullWidth onClick={() => { setYearFilter(''); setPeriodFilter(''); setFilterDrawerOpen(false); }}
            sx={{ mt: 2, borderRadius: '100px', fontWeight: 700, color: 'text.secondary' }}
          >
            Καθαρισμός φίλτρων
          </Button>
        )}
      </Drawer>

      {/* ── Snackbar ── */}
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

      {/* ── File Preview Drawer ── */}
      <FilePreviewDrawer
        open={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        file={previewFile}
        uploader={previewFile ? (uploaders[previewFile.uploader] || '') : ''}
        isAdmin={isAdmin}
        onApprove={async (id) => { await handleApprove(id); setPreviewFile(f => f ? { ...f, approved: true } : f); }}
        onDelete={(id, url) => { setPreviewFile(null); setConfirmDel({ id, file_url: url }); }}
      />

      {/* ── Confirm Delete dialog ── */}
      <Dialog open={Boolean(confirmDel)} onClose={() => setConfirmDel(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pt: 2.5, fontSize: '1rem' }}>Διαγραφή Αρχείου</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            Είσαι σίγουρος; Το αρχείο θα διαγραφεί οριστικά.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setConfirmDel(null)} sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 600 }}>Ακύρωση</Button>
          <Button onClick={handleDeleteConfirmed} color="error" variant="contained" startIcon={<DeleteOutlineRoundedIcon />}
            sx={{ flex: 1, borderRadius: '10px', textTransform: 'none', fontWeight: 700 }}>
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

/* ── FileCard sub-component ── */
function FileCard({ file, idx, semColor, isDark, isAdmin, user, course, onPreview, onDownload, onShare, onApprove, onDelete, toDisplayPeriod }) {
  const displayPeriod = toDisplayPeriod(file.period);
  const periodEmoji = PERIOD_ICONS[displayPeriod] || '📄';

  return (
    <Box
      onClick={onPreview}
      sx={{
        p: { xs: '14px 16px', sm: '16px 20px' },
        borderRadius: '16px',
        bgcolor: isDark ? 'rgba(255,255,255,0.028)' : '#fff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.22s ease',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        animation: 'fadeInUp 0.4s ease both',
        animationDelay: `${0.04 + idx * 0.04}s`,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0, top: '20%', bottom: '20%',
          width: '3px', borderRadius: '0 3px 3px 0',
          bgcolor: semColor,
          opacity: 0,
          transition: 'opacity 0.22s ease',
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark
            ? `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px ${semColor}25`
            : `0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px ${semColor}20`,
          borderColor: `${semColor}35`,
          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : `${semColor}05`,
          '&::before': { opacity: 1 },
        },
      }}
    >
      {/* Icon */}
      <Box sx={{
        width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
        bgcolor: `${semColor}14`,
        border: '1px solid', borderColor: `${semColor}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <DescriptionRoundedIcon sx={{ color: semColor, fontSize: 22 }} />
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Year + period */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.6 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: 'text.primary' }}>
            {file.year}
          </Typography>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 1, py: 0.2,
            borderRadius: '8px',
            bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
          }}>
            <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: 'text.secondary' }}>
              {periodEmoji} {displayPeriod}
            </Typography>
          </Box>
        </Box>

        {/* Status chip (only visible to admins or pending files) */}
        {(isAdmin && user) && (
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 1, py: 0.2, borderRadius: '8px',
            bgcolor: file.approved
              ? isDark ? 'rgba(15,157,88,0.15)' : 'rgba(30,142,62,0.08)'
              : isDark ? 'rgba(227,116,0,0.15)' : 'rgba(227,116,0,0.1)',
          }}>
            <Typography sx={{
              fontSize: '0.68rem', fontWeight: 700,
              color: file.approved
                ? isDark ? '#81c784' : '#1e8e3e'
                : isDark ? '#ffb74d' : '#e37400',
            }}>
              {file.approved ? '✓ Εγκεκριμένο' : '⏳ Αναμονή'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Actions */}
      <Box onClick={e => e.stopPropagation()} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <ActionBtn title="Προβολή" onClick={onPreview} color={semColor} isDark={isDark}>
          <VisibilityRoundedIcon sx={{ fontSize: 17 }} />
        </ActionBtn>
        <ActionBtn title="Λήψη" onClick={onDownload} color={semColor} isDark={isDark}>
          <DownloadRoundedIcon sx={{ fontSize: 17 }} />
        </ActionBtn>
        <ActionBtn title="Κοινοποίηση" onClick={onShare} color={semColor} isDark={isDark}>
          <ShareRoundedIcon sx={{ fontSize: 17 }} />
        </ActionBtn>
        {user && isAdmin && !file.approved && (
          <ActionBtn title="Έγκριση" onClick={onApprove} color="#0f9d58" isDark={isDark}>
            <CheckRoundedIcon sx={{ fontSize: 17 }} />
          </ActionBtn>
        )}
        {user && isAdmin && (
          <ActionBtn title="Διαγραφή" onClick={onDelete} color="#d93025" isDark={isDark}>
            <DeleteRoundedIcon sx={{ fontSize: 17 }} />
          </ActionBtn>
        )}
      </Box>
    </Box>
  );
}

/* ── Tiny action icon button ── */
function ActionBtn({ title, onClick, color, isDark, children }) {
  return (
    <Tooltip title={title} arrow>
      <IconButton
        size="small"
        onClick={onClick}
        sx={{
          width: 32, height: 32,
          color: 'text.disabled',
          borderRadius: '10px',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
          transition: 'all 0.15s ease',
          '&:hover': {
            color,
            bgcolor: `${color}12`,
            borderColor: `${color}35`,
            transform: 'scale(1.1)',
          },
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
}

export default CourseFiles;