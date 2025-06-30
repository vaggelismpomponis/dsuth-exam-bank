import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, TextField, MenuItem, Alert, CircularProgress, Stack, Skeleton, Card, CardContent } from '@mui/material';
import { supabase } from '../../supabaseClient';
import UploadFileIcon from '@mui/icons-material/UploadFile';

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

const AdminUpload = () => {
  const [user, setUser] = useState(undefined);
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [period, setPeriod] = useState('');
  const [semester, setSemester] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fileResults, setFileResults] = useState([]); // [{name, status, message}]
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

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
  }, []);

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
    setError('');
    setSuccess('');
    setFileResults([]);
    if (!course || !year || !period || files.length === 0) {
      setError('Συμπλήρωσε όλα τα πεδία και επίλεξε αρχεία.');
      return;
    }
    setLoading(true);
    const results = [];
    // Για αύξοντα αριθμό στα ονόματα
    let fileIndex = 1;
    for (const file of files) {
      // Δημιουργία νέου ονόματος αρχείου
      const fileExt = file.name.split('.').pop();
      const courseLatin = greekToLatin(course);
      const periodLatin = greekToLatin(period);
      const fileName = `${courseLatin}_${year}_${periodLatin}_Themata_${fileIndex}.${fileExt}`;
      // Δημιουργία νέου File αντικειμένου με το νέο όνομα
      let renamedFile;
      try {
        renamedFile = new File([file], fileName, { type: file.type });
      } catch (err) {
        renamedFile = file;
      }
      // 1. Ανεβάζουμε το αρχείο στο Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage.from('exams').upload(fileName, renamedFile);
      if (storageError) {
        results.push({ name: file.name, status: 'error', message: 'Σφάλμα στο ανέβασμα: ' + storageError.message });
        fileIndex++;
        continue;
      }
      // 2. Παίρνουμε το public URL
      const { data: publicUrlData } = supabase.storage.from('exams').getPublicUrl(fileName);
      // 3. Καταχωρούμε στη βάση
      const { error: dbError } = await supabase.from('exams').insert([
        {
          course,
          year: parseInt(year),
          period,
          uploader: user?.id || 'admin',
          file_url: publicUrlData.publicUrl,
          approved: true,
        },
      ]);
      if (dbError) {
        results.push({ name: file.name, status: 'error', message: 'Σφάλμα στη βάση: ' + dbError.message });
        fileIndex++;
        continue;
      }
      results.push({ name: file.name, status: 'success', message: 'Το αρχείο ανέβηκε!' });
      fileIndex++;
    }
    setFileResults(results);
    if (results.every(r => r.status === 'success')) {
      setSuccess('Όλα τα αρχεία ανέβηκαν με επιτυχία!');
      setCourse('');
      setYear('');
      setPeriod('');
      setSemester('');
      setFiles([]);
    } else {
      setError('Κάποια αρχεία δεν ανέβηκαν.');
    }
    setLoading(false);
  };

  const filteredCourses = semester
    ? courses.filter((c) => c.semester === Number(semester))
    : [];

  // Drag & Drop handlers
  const acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
  ];
  const filterFiles = (fileList) => {
    return Array.from(fileList).filter(f => acceptedTypes.includes(f.type));
  };
  const mergeFiles = (oldFiles, newFiles) => {
    const names = new Set(oldFiles.map(f => f.name));
    return [...oldFiles, ...newFiles.filter(f => !names.has(f.name))];
  };
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filtered = filterFiles(e.dataTransfer.files);
      setFiles(prev => mergeFiles(prev, filtered));
    }
  };
  const handleFileInput = (e) => {
    const filtered = filterFiles(e.target.files);
    setFiles(prev => mergeFiles(prev, filtered));
  };

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
              ΑΝΕΒΑΣΜΑ ΠΟΛΛΑΠΛΩΝ ΑΡΧΕΙΩΝ ΕΞΕΤΑΣΗΣ (ADMIN)
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
              Συμπλήρωσε τα στοιχεία και ανέβασε πολλά αρχεία (PDF, Word, PNG, JPG) για το ίδιο μάθημα/εξάμηνο/έτος/εξεταστική.
            </Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
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
              {/* Drag & Drop area */}
              <Box
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                sx={{
                  border: dragActive ? '2px solid #1976d2' : '2px dashed #90caf9',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  background: dragActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                  color: '#1976d2',
                  fontWeight: 600,
                  mb: 1.5,
                  cursor: 'pointer',
                  transition: 'border 0.2s, background 0.2s',
                  outline: 'none',
                  userSelect: 'none',
                }}
                tabIndex={0}
                onClick={() => document.getElementById('admin-upload-input').click()}
              >
                Σύρε εδώ τα αρχεία ή κάνε κλικ για επιλογή
                <input
                  id="admin-upload-input"
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
              </Box>
              {/* Εναλλακτικό κουμπί επιλογής */}
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ fontWeight: 700, borderRadius: 2 }}
                color="primary"
              >
                Επιλογή Αρχείων
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
              </Button>
              {files.length > 0 && (
                <Box sx={{ fontSize: 14, color: '#1976d2', fontWeight: 500 }}>
                  {files.length} αρχεία επιλεγμένα: {files.map(f => f.name).join(', ')}
                </Box>
              )}
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={loading}
                sx={{ fontWeight: 700, borderRadius: 2 }}
                fullWidth
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UploadFileIcon />}
              >
                ΑΝΕΒΑΣΜΑ
              </Button>
            </Stack>
          </Box>
          {fileResults.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Αποτελέσματα:</Typography>
              <ul style={{ paddingLeft: 18 }}>
                {fileResults.map((r, i) => (
                  <li key={i} style={{ color: r.status === 'success' ? 'green' : 'red', fontWeight: 500 }}>
                    {r.name}: {r.message}
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AdminUpload; 