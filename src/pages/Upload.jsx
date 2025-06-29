import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, TextField, MenuItem, Alert, CircularProgress, Stack, Skeleton, IconButton, Tooltip, Card, CardContent, InputAdornment, Link as MuiLink, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Turnstile } from '@marsidev/react-turnstile';
import { useSnackbar } from 'notistack';
import { validateTurnstileToken } from '../utils/turnstileValidation';

const periods = [
  'Ιανουάριος',
  'Ιούνιος',
  'Σεπτέμβριος',
  'Επαναληπτική',
];

// Helper για μετατροπή ελληνικών σε λατινικούς χαρακτήρες
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
    .replace(/[^a-zA-Z0-9]/g, '') // Αφαίρεση ειδικών χαρακτήρων
    .replace(/\s+/g, ''); // Αφαίρεση κενών
}

const Upload = () => {
  const [user, setUser] = useState(undefined);
  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [period, setPeriod] = useState('');
  const [semester, setSemester] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [canSubmit, setCanSubmit] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
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
    
    // Server-side validation of Turnstile token
    const validationResult = await validateTurnstileToken(turnstileToken);
    if (!validationResult.success) {
      setError('Η επαλήθευση απέτυχε. Παρακαλώ δοκιμάστε ξανά.');
      enqueueSnackbar('Η επαλήθευση απέτυχε. Παρακαλώ δοκιμάστε ξανά.', { variant: 'error' });
      return;
    }
    
    if (!course || !year || !period || !file) {
      setError('Συμπλήρωσε όλα τα πεδία και επίλεξε αρχείο.');
      return;
    }
    setLoading(true);
    // Δημιουργία νέου ονόματος αρχείου
    const fileExt = file.name.split('.').pop();
    const courseLatin = greekToLatin(course);
    const periodLatin = greekToLatin(period);
    let baseFileName = `${courseLatin}_${year}_${periodLatin}_Themata`;
    let fileName = `${baseFileName}.${fileExt}`;
    let counter = 1;
    // Έλεγχος αν υπάρχει ήδη αρχείο με το ίδιο όνομα στο storage
    while (true) {
      const { data: existsData, error: existsError } = await supabase.storage.from('exams').list('', { search: fileName });
      if (existsError || !existsData || existsData.length === 0) break;
      // Αν υπάρχει, αύξησε τον αριθμό
      fileName = `${baseFileName}_${counter}.${fileExt}`;
      counter++;
    }
    // Δημιουργία νέου File αντικειμένου με το νέο όνομα
    let renamedFile;
    try {
      renamedFile = new File([file], fileName, { type: file.type });
    } catch (err) {
      // Fallback για παλαιότερα browsers
      renamedFile = file;
    }
    // 1. Ανεβάζουμε το αρχείο στο Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage.from('exams').upload(fileName, renamedFile);
    if (storageError) {
      setError('Σφάλμα στο ανέβασμα αρχείου: ' + storageError.message);
      setLoading(false);
      return;
    }
    // 2. Παίρνουμε το public URL
    const { data: publicUrlData } = supabase.storage.from('exams').getPublicUrl(fileName);
    // 3. Καταχωρούμε στη βάση
    const { error: dbError } = await supabase.from('exams').insert([
      {
        course,
        year: parseInt(year),
        period,
        uploader: user.id,
        file_url: publicUrlData.publicUrl,
        approved: false,
      },
    ]);
    if (dbError) {
      setError('Σφάλμα στη βάση: ' + dbError.message);
      setLoading(false);
      return;
    }
    setSuccess('Το αρχείο ανέβηκε με επιτυχία!');
    enqueueSnackbar('Το αρχείο ανέβηκε με επιτυχία!', { variant: 'success' });
    setCourse('');
    setYear('');
    setPeriod('');
    setFile(null);
    setLoading(false);
  };

  const filteredCourses = semester
    ? courses.filter((c) => c.semester === Number(semester))
    : [];

  if (user === undefined || loading) return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h5" color="primary" gutterBottom align={isMobile ? 'center' : 'left'}>
        ΑΝΕΒΑΣΜΑ ΑΡΧΕΙΟΥ ΕΞΕΤΑΣΗΣ
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Stack spacing={2} direction="column">
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2, width: '60%' }} />
          <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2, width: '100%' }} />
        </Stack>
      </Box>
    </Container>
  );

  if (!user) return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 420, mt: 6 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" align="center" color="primary" fontWeight={700}>
            Ανέβασμα Αρχείου
          </Typography>
        </Box>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ mb: 2 }}>
            <Alert severity="info" sx={{ fontSize: 17, fontWeight: 500, textAlign: 'center', mb: 2 }}>
              Για να ανεβάσετε αρχεία, πρέπει να συνδεθείτε.
            </Alert>
            <Button variant="contained" color="primary" fullWidth sx={{ fontWeight: 700, fontSize: 17, textTransform: 'none' }} onClick={() => navigate('/login')}>
              Σύνδεση
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );

  return (
    <Container maxWidth="sm" sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Card sx={{ width: '100%', maxWidth: 480, borderRadius: 4, boxShadow: 6, px: { xs: 1, sm: 3 }, py: 2, background: 'linear-gradient(135deg, #e3eafc 0%, #f4f6f8 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Box sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1976d2 0%, #64b5f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1.5,
              boxShadow: 3
            }}>
              <UploadFileIcon sx={{ color: '#fff', fontSize: 40 }} />
            </Box>
            <Typography variant="h5" color="primary" fontWeight={700} gutterBottom align="center">
              ΑΝΕΒΑΣΜΑ ΑΡΧΕΙΟΥ ΕΞΕΤΑΣΗΣ
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
              Συμπλήρωσε τα στοιχεία και ανέβασε το αρχείο σου (PDF, Word, PNG, JPG).
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleUpload} sx={{ mt: 1 }}>
            <Stack spacing={2} direction="column">
              <TextField
                label="ΕΞΑΜΗΝΟ"
                select
                fullWidth
                value={semester}
                onChange={e => {
                  setSemester(e.target.value);
                  setCourse('');
                }}
              >
                {[...Array(8)].map((_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{i + 1}ο Εξάμηνο</MenuItem>
                ))}
              </TextField>
              <TextField
                label="ΜΑΘΗΜΑ"
                select
                fullWidth
                value={course}
                onChange={e => setCourse(e.target.value)}
                disabled={coursesLoading || !semester}
                helperText={
                  coursesLoading
                    ? 'Φόρτωση μαθημάτων...'
                    : !semester
                    ? 'Επίλεξε πρώτα εξάμηνο.'
                    : filteredCourses.length === 0
                    ? 'Δεν υπάρχουν διαθέσιμα μαθήματα για το εξάμηνο.'
                    : ''
                }
              >
                {filteredCourses.map((c) => (
                  <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="ΕΤΟΣ ΑΡΧΕΙΟΥ"
                type="number"
                fullWidth
                value={year}
                onChange={e => setYear(e.target.value)}
              />
              <TextField
                label="ΕΞΕΤΑΣΤΙΚΗ"
                select
                fullWidth
                value={period}
                onChange={e => setPeriod(e.target.value)}
              >
                {periods.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </TextField>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Tooltip title="Επιλογή αρχείου">
                  <IconButton
                    color="primary"
                    component="label"
                    sx={{ width: 56, height: 56, borderRadius: '50%', background: '#e3eafc', '&:hover': { background: '#d0e2ff' } }}
                  >
                    <UploadFileIcon sx={{ fontSize: 32 }} />
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                      onChange={e => setFile(e.target.files[0])}
                    />
                  </IconButton>
                </Tooltip>
              </Box>
              {file && <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>{file.name}</Typography>}
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <Turnstile
                  siteKey="0x4AAAAAABiQtKNjlTVw7zFL"
                  onSuccess={(token) => {
                    setTurnstileToken(token);
                    setCanSubmit(true);
                  }}
                  onExpire={() => {
                    setTurnstileToken('');
                    setCanSubmit(false);
                  }}
                  onError={() => {
                    setTurnstileToken('');
                    setCanSubmit(false);
                  }}
                  theme="light"
                  size="normal"
                />
              </Box>
              <Box sx={{ mt: 2, position: 'relative' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading || !canSubmit}
                  fullWidth
                  sx={{ fontSize: isMobile ? '1.1rem' : '1rem', py: isMobile ? 2 : 1, borderRadius: 2, fontWeight: 700, boxShadow: 2 }}
                >
                  ΑΝΕΒΑΣΜΑ
                </Button>
                {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Upload; 