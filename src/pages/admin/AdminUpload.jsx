import React, { useEffect, useState } from 'react';
import { Typography, Box, Button, TextField, MenuItem, Alert, CircularProgress, Stack, Skeleton, Card, CardContent, Autocomplete, useTheme, useMediaQuery } from '@mui/material';
import { supabase } from '../../supabaseClient';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { convertToPdf } from '../../utils/pdfConversion';
import { Capacitor } from '@capacitor/core';
import PdfPreview from '../../components/PdfPreview';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const [conversionMessage, setConversionMessage] = useState('');
  const [filePreviews, setFilePreviews] = useState({});

  useEffect(() => {
    const urls = {};
    files.forEach(f => {
      urls[f.name] = URL.createObjectURL(f);
    });
    setFilePreviews(urls);
    return () => {
      Object.values(urls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]);

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
  const handleFilesSelection = async (fileList) => {
    const filtered = filterFiles(fileList);
    if (filtered.length === 0) return;

    setConversionMessage(`Αρχικοποίηση μετατροπής για ${filtered.length} αρχεία...`);
    const processedFiles = [];

    for (let i = 0; i < filtered.length; i++) {
      const file = filtered[i];
      const progressPrefix = `[${i + 1}/${filtered.length}]`;
      const processed = await convertToPdf(file, (msg) => setConversionMessage(`${progressPrefix} ${msg}`));
      processedFiles.push(processed);
    }

    setFiles(prev => mergeFiles(prev, processedFiles));
    setConversionMessage('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (conversionMessage) return; // disable drag while converting
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (conversionMessage) return;
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelection(e.dataTransfer.files);
    }
  };
  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelection(e.target.files);
    }
    // reset input value so the same files can be selected again if removed
    e.target.value = null;
  };

  return (
    <Box sx={{ mt: 6, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
      <Card sx={{ width: '100%', maxWidth: 480, borderRadius: 4, boxShadow: 6, px: { xs: 1, sm: 3 }, py: 2, background: theme.palette.mode === 'light' ? 'linear-gradient(135deg, #e3eafc 0%, #f4f6f8 100%)' : theme.palette.background.paper }}>
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
                    label="ΜΑΘΗΜΑ"
                    helperText={
                      coursesLoading
                        ? 'Φόρτωση μαθημάτων...'
                        : !semester
                          ? 'Επίλεξε πρώτα εξάμηνο.'
                          : filteredCourses.length === 0
                            ? 'Δεν υπάρχουν διαθέσιμα μαθήματα για το εξάμηνο.'
                            : ''
                    }
                  />
                )}
              />
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
              {conversionMessage ? (
                <Stack direction="column" alignItems="center" justifyContent="center" spacing={2} sx={{ py: 4, mb: 1.5, border: '2px solid', borderColor: 'primary.main', borderRadius: 2, bgcolor: theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.04)' : 'rgba(138,180,248,0.08)' }}>
                  <CircularProgress size={32} />
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'center' }}>
                    {conversionMessage}
                  </Typography>
                </Stack>
              ) : (
                <Box
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  sx={{
                    border: dragActive ? '2px solid' : '2px dashed',
                    borderColor: dragActive ? 'primary.main' : (theme.palette.mode === 'light' ? '#90caf9' : 'rgba(138,180,248,0.4)'),
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    background: dragActive ? (theme.palette.mode === 'light' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(138,180,248,0.12)') : 'transparent',
                    color: 'primary.main',
                    fontWeight: 600,
                    mb: 1.5,
                    cursor: 'pointer',
                    transition: 'border 0.2s, background 0.2s',
                    outline: 'none',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent',
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
              )}
              {/* Εναλλακτικό κουμπί επιλογής */}
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ fontWeight: 700, borderRadius: 2 }}
                color="primary"
                disabled={!!conversionMessage}
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
                <Box sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: 'primary.main', fontWeight: 600 }}>
                    {files.length} αρχεία επιλεγμένα:
                  </Typography>
                  <Stack spacing={1.5}>
                    {files.map(f => (
                      <Box key={f.name} sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: theme.palette.mode === 'light' ? '#fff' : 'background.default', position: 'relative' }}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFiles(prev => prev.filter(file => file.name !== f.name));
                            setFilePreviews(prev => {
                              const newPreviews = { ...prev };
                              delete newPreviews[f.name];
                              return newPreviews;
                            });
                          }}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            color: '#d32f2f !important',
                            '&:hover': { bgcolor: 'rgba(211, 47, 47, 0.08) !important' }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        {f.type.startsWith('image/') ? (
                          <Box component="img" src={filePreviews[f.name]} sx={{ maxHeight: 150, maxWidth: '100%', objectFit: 'contain', borderRadius: 1 }} />
                        ) : f.type === 'application/pdf' ? (
                          (isMobile || Capacitor.isNativePlatform()) ? (
                            <Box sx={{ width: '100%', height: 250, overflow: 'auto', display: 'flex', justifyContent: 'center', bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#1a1a1a', borderRadius: 1 }}>
                              <PdfPreview fileUrl={filePreviews[f.name]} showAllPages={false} />
                            </Box>
                          ) : (
                            <Box component="iframe" src={`${filePreviews[f.name]}#toolbar=0`} sx={{ width: '100%', height: 250, border: 'none', borderRadius: 1 }} />
                          )
                        ) : (
                          <InsertDriveFileIcon sx={{ color: 'primary.main', fontSize: 40, alignSelf: 'center', my: 2 }} />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-all', color: 'text.primary' }}>{f.name}</Typography>
                      </Box>
                    ))}
                  </Stack>
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
    </Box>
  );
};

export default AdminUpload; 