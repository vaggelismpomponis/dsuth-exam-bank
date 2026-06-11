import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, TextField, MenuItem, Alert, CircularProgress, Stack, Skeleton, IconButton, Tooltip, Paper, Autocomplete, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { trackEvent } from '../lib/analytics';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { Turnstile } from '@marsidev/react-turnstile';
import { useSnackbar } from 'notistack';
import { validateTurnstileToken } from '../utils/turnstileValidation';
import { convertToPdf } from '../utils/pdfConversion';
import { Capacitor } from '@capacitor/core';
import PdfPreview from '../components/PdfPreview';

const periods = [
  'Ιανουάριος',
  'Ιούνιος',
  'Σεπτέμβριος',
  'Επαναληπτική',
];

function greekToLatin(str) {
  const map = {
    'Α': 'A', 'Β': 'V', 'Γ': 'G', 'Δ': 'D', 'Ε': 'E', 'Ζ': 'Z', 'Η': 'I', 'Θ': 'Th',
    'Ι': 'I', 'Κ': 'K', 'Λ': 'L', 'Μ': 'M', 'Ν': 'N', 'Ξ': 'X', 'Ο': 'O', 'Π': 'P',
    'Ρ': 'R', 'Σ': 'S', 'Τ': 'T', 'Υ': 'Y', 'Φ': 'F', 'Χ': 'Ch', 'Ψ': 'Ps', 'Ω': 'O',
    'ά': 'a', 'έ': 'e', 'ή': 'i', 'ί': 'i', 'ό': 'o', 'ύ': 'y', 'ώ': 'o', 'ς': 's',
    'ϊ': 'i', 'ΰ': 'y', 'ϋ': 'y', 'ΐ': 'i',
    'α': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'ζ': 'z', 'η': 'i', 'θ': 'th',
    'ι': 'i', 'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'π': 'p',
    'ρ': 'r', 'σ': 's', 'τ': 't', 'υ': 'y', 'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o',
    'Ά': 'A', 'Έ': 'E', 'Ή': 'I', 'Ί': 'I', 'Ό': 'O', 'Ύ': 'Y', 'Ώ': 'O', 'Ϊ': 'I', 'Ϋ': 'Y',
  };
  return str.split('').map(l => map[l] || l).join('')
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/\s+/g, '');
}

const Upload = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user, setUser] = useState(undefined);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [period, setPeriod] = useState('');
  const [semester, setSemester] = useState('');
  const [file, setFile] = useState(null);
  const [conversionMessage, setConversionMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => { listener?.subscription.unsubscribe(); };
  }, [navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      const { data, error } = await supabase.from('courses').select('*').order('name', { ascending: true });
      if (!error && data) setCourses(data);
      setCoursesLoading(false);
    };
    fetchCourses();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      setError('Παρακαλώ ολοκληρώστε την επαλήθευση.');
      enqueueSnackbar('Παρακαλώ ολοκληρώστε την επαλήθευση.', { variant: 'error' });
      return;
    }
    setError('');
    setSuccess('');

    const validationResult = await validateTurnstileToken(turnstileToken);
    if (!validationResult.success) {
      setError('Η επαλήθευση απέτυχε. Παρακαλώ δοκιμάστε ξανά.');
      enqueueSnackbar('Η επαλήθευση απέτυχε.', { variant: 'error' });
      return;
    }

    if (!course || !year || !period || !file) {
      setError('Συμπλήρωσε όλα τα πεδία και επίλεξε αρχείο.');
      return;
    }
    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const courseLatin = greekToLatin(course);
    const periodLatin = greekToLatin(period);
    let baseFileName = `${courseLatin}_${year}_${periodLatin}_Themata`;
    let fileName = `${baseFileName}.${fileExt}`;
    let counter = 1;
    while (true) {
      const { data: existsData, error: existsError } = await supabase.storage.from('exams').list('', { search: fileName });
      if (existsError || !existsData || existsData.length === 0) break;
      fileName = `${baseFileName}_${counter}.${fileExt}`;
      counter++;
    }
    let renamedFile;
    try {
      renamedFile = new File([file], fileName, { type: file.type });
    } catch (err) {
      renamedFile = file;
    }
    // cacheControl: 7 days — Supabase CDN will serve repeat downloads from edge cache
    // instead of re-fetching from storage disk on every request. This directly reduces Cached Egress.
    const { data: storageData, error: storageError } = await supabase.storage
      .from('exams')
      .upload(fileName, renamedFile, { cacheControl: '604800' });
    if (storageError) {
      setError('Σφάλμα στο ανέβασμα: ' + storageError.message);
      setLoading(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from('exams').getPublicUrl(fileName);
    const { error: dbError } = await supabase.from('exams').insert([
      { course, year: parseInt(year), period, uploader: user.id, file_url: publicUrlData.publicUrl, approved: false },
    ]);
    if (dbError) {
      setError('Σφάλμα στη βάση: ' + dbError.message);
      setLoading(false);
      return;
    }
    
    // Log the upload event with resolved course ID
    const courseObj = courses.find(c => c.name === course);
    trackEvent('upload', { courseId: courseObj?.id, courseName: course, year: parseInt(year), period });

    setSuccess('Το αρχείο ανέβηκε με επιτυχία!');
    enqueueSnackbar('Το αρχείο ανέβηκε με επιτυχία!', { variant: 'success' });
    setCourse(''); setYear(''); setPeriod(''); setFile(null);
    setLoading(false);
  };

  const filteredCourses = semester
    ? courses.filter((c) => c.semester === Number(semester))
    : [];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleFileSelection = async (selectedFile) => {
    if (!selectedFile) return;
    setConversionMessage('Αρχικοποίηση...');
    const processedFile = await convertToPdf(selectedFile, setConversionMessage);
    setFile(processedFile);
    setConversionMessage(''); // Done
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  if (user === undefined || loading) return (
    <Container maxWidth="sm" sx={{ pt: { xs: 2, md: 5 }, pb: { xs: 12, md: 4 } }}>
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={56} />
        <Skeleton variant="rounded" height={120} />
      </Stack>
    </Container>
  );

  if (!user) return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', pt: { xs: 2, md: 4 }, pb: { xs: 12, md: 4 }, px: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 420, p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
        <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Ανέβασμα Αρχείου</Typography>
        <Alert severity="info" sx={{ mb: 2.5, textAlign: 'center' }}>
          Για να ανεβάσετε αρχεία, πρέπει να συνδεθείτε.
        </Alert>
        <Button variant="contained" fullWidth onClick={() => navigate('/login')} sx={{ py: 1.3 }}>
          Σύνδεση
        </Button>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', py: { xs: 2, md: 5 }, px: 2, pb: { xs: 12, md: 5 } }}>
      <Paper sx={{ width: '100%', maxWidth: 500, p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: 3, bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'rgba(138,180,248,0.15)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 1.5,
          }}>
            <UploadFileIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>Ανέβασμα Αρχείου</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            PDF, Word, PNG, JPG
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleUpload}>
          <Stack spacing={2.5}>
            <TextField
              label="Εξάμηνο"
              select
              fullWidth
              value={semester}
              onChange={e => { setSemester(e.target.value); setCourse(''); }}
            >
              {[...Array(8)].map((_, i) => (
                <MenuItem key={i + 1} value={i + 1}>{i + 1}ο Εξάμηνο</MenuItem>
              ))}
            </TextField>

            <Autocomplete
              fullWidth
              disabled={coursesLoading || !semester || filteredCourses.length === 0}
              options={filteredCourses.map(c => c.name)}
              value={course || null}
              onChange={(e, newValue) => setCourse(newValue || '')}
              isOptionEqualToValue={(option, value) => option === value}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Μάθημα"
                  helperText={
                    coursesLoading ? 'Φόρτωση μαθημάτων...'
                      : !semester ? 'Επίλεξε πρώτα εξάμηνο.'
                        : filteredCourses.length === 0 ? 'Δεν υπάρχουν μαθήματα.'
                          : ''
                  }
                />
              )}
            />

            <TextField label="Έτος αρχείου" type="number" fullWidth value={year} onChange={e => setYear(e.target.value)} />

            <TextField label="Εξεταστική" select fullWidth value={period} onChange={e => setPeriod(e.target.value)}>
              {periods.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>

            {/* Drop Zone */}
            <Box
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                border: '2px dashed',
                borderColor: dragActive ? 'primary.main' : 'divider',
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: (t) => dragActive ? (t.palette.mode === 'light' ? '#e8f0fe' : 'rgba(138,180,248,0.12)') : 'transparent',
                transition: 'all 0.2s',
                WebkitTapHighlightColor: 'transparent',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: (t) => t.palette.mode === 'light' ? '#f3f7fe' : 'rgba(138,180,248,0.08)'
                },
                '&:active': {
                  bgcolor: (t) => t.palette.mode === 'light' ? '#e8f0fe' : 'rgba(138,180,248,0.12)'
                }
              }}
              component="label"
            >
              {conversionMessage ? (
                <Stack direction="column" alignItems="center" justifyContent="center" spacing={2} sx={{ py: 3 }}>
                  <CircularProgress size={32} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    {conversionMessage}
                  </Typography>
                </Stack>
              ) : file ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                  {file.type.startsWith('image/') ? (
                    <Box component="img" src={previewUrl} sx={{ maxHeight: 200, maxWidth: '100%', objectFit: 'contain', borderRadius: 2, boxShadow: 1 }} />
                  ) : file.type === 'application/pdf' ? (
                    isMobile || Capacitor.isNativePlatform() ? (
                      <Box sx={{ width: '100%', height: 400 }}>
                        <PdfPreview fileUrl={previewUrl} showAllPages={false} />
                      </Box>
                    ) : (
                      <Box component="iframe" src={`${previewUrl}#toolbar=0`} sx={{ width: '100%', height: 400, border: 'none', borderRadius: 2, boxShadow: 1 }} />
                    )
                  ) : (
                    <InsertDriveFileIcon sx={{ color: 'primary.main', fontSize: 60 }} />
                  )}
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', wordBreak: 'break-all' }}>Επιτυχής μετατροπή: {file.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>Το αρχείο είναι έτοιμο για ανέβασμα!</Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setFile(null);
                      setPreviewUrl('');
                    }}
                    sx={{
                      mt: 1,
                      borderRadius: 2,
                      color: '#d32f2f !important',
                      borderColor: '#d32f2f !important',
                      '&:hover': {
                        bgcolor: 'rgba(211, 47, 47, 0.08) !important',
                        borderColor: '#d32f2f !important'
                      }
                    }}
                    startIcon={<DeleteIcon />}
                  >
                    Διαγραφή Αρχείου
                  </Button>
                </Box>
              ) : (
                <>
                  <CloudUploadIcon sx={{ color: 'text.secondary', fontSize: 36, mb: 1 }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    Σύρε αρχείο εδώ ή πάτα για επιλογή
                  </Typography>
                </>
              )}
              <input
                type="file"
                hidden
                disabled={!!conversionMessage}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                onChange={e => handleFileSelection(e.target.files[0])}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
              <Turnstile
                siteKey="0x4AAAAAABiQtKNjlTVw7zFL"
                onSuccess={(token) => { setTurnstileToken(token); setCanSubmit(true); }}
                onExpire={() => { setTurnstileToken(''); setCanSubmit(false); }}
                onError={() => { setTurnstileToken(''); setCanSubmit(false); }}
                theme="light"
                size="normal"
              />
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Box sx={{ position: 'relative' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !canSubmit}
                fullWidth
                sx={{ py: 1.3, fontSize: '0.938rem' }}
              >
                Ανέβασμα
              </Button>
              {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default Upload;