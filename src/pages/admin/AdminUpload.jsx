import React, { useEffect, useState } from 'react';
import {
  Typography, Box, Button, TextField, MenuItem, Alert, CircularProgress,
  Stack, Skeleton, Card, CardContent, Autocomplete, useTheme, useMediaQuery,
  alpha, Icon, IconButton, Divider, Grid, Tooltip,
} from '@mui/material';
import { supabase } from '../../supabaseClient';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DoneAllIcon from '@mui/icons-material/DoneAll';
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

const PageHeader = ({ title, subtitle , icon }) => {
    return (
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                    width: 44, height: 44, borderRadius: '14px',
                    background: 'linear-gradient(135deg, #1a73e8 0%, #0052cc 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 16px rgba(26,115,232,0.35)',
                }}>
                    {React.cloneElement(icon, { sx: { color: '#fff', fontSize: 22 } })}
                </Box>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2 }}>{subtitle}</Typography>
                </Box>
            </Box>
        </Box>
    );
};

const AdminUpload = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
    if (e) e.preventDefault();
    setError(''); setSuccess(''); setFileResults([]);
    if (!course || !year || !period || files.length === 0) {
      setError('Συμπλήρωσε όλα τα πεδία και επίλεξε αρχεία.');
      return;
    }
    setLoading(true);
    const results = [];
    let fileIndex = 1;
    for (const file of files) {
      const fileExt = 'pdf'; // assuming PDF as we convert
      const courseLatin = greekToLatin(course);
      const periodLatin = greekToLatin(period);
      const fileName = `${courseLatin}_${year}_${periodLatin}_Themata_${fileIndex}_${Date.now()}.${fileExt}`;
      
      const { data: storageData, error: storageError } = await supabase.storage.from('exams').upload(fileName, file);
      if (storageError) {
        results.push({ name: file.name, status: 'error', message: storageError.message });
        fileIndex++; continue;
      }
      const { data: publicUrlData } = supabase.storage.from('exams').getPublicUrl(fileName);
      const { error: dbError } = await supabase.from('exams').insert([
        { course, year: parseInt(year), period, uploader: user?.id || 'admin', file_url: publicUrlData.publicUrl, approved: true },
      ]);
      if (dbError) results.push({ name: file.name, status: 'error', message: dbError.message });
      else results.push({ name: file.name, status: 'success', message: 'Ολοκληρώθηκε!' });
      fileIndex++;
    }
    setFileResults(results);
    if (results.every(r => r.status === 'success')) {
      setSuccess('Όλα τα αρχεία ανέβηκαν με επιτυχία!');
      setFiles([]);
    } else setError('Κάποια αρχεία δεν ανέβηκαν.');
    setLoading(false);
  };

  const filteredCourses = semester ? courses.filter((c) => c.semester === Number(semester)) : [];

  const handleFilesSelection = async (fileList) => {
    const list = Array.from(fileList);
    if (!list.length) return;
    setConversionMessage(`Προετοιμασία ${list.length} αρχείων...`);
    const processedFiles = [];
    for (let i = 0; i < list.length; i++) {
        const file = list[i];
        setConversionMessage(`[${i + 1}/${list.length}] Μετατροπή: ${file.name}`);
        const processed = await convertToPdf(file);
        processedFiles.push(processed);
    }
    setFiles(prev => {
        const existing = new Set(prev.map(f => f.name));
        return [...prev, ...processedFiles.filter(f => !existing.has(f.name))];
    });
    setConversionMessage('');
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) handleFilesSelection(e.dataTransfer.files);
  };

  const cardStyle = {
    p: { xs: 2.5, sm: 4 }, borderRadius: '24px',
    background: isDark ? alpha('#fff', 0.04) : '#ffffff',
    border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    boxShadow: isDark ? 'none' : '0 8px 32px rgba(0,0,0,0.06)',
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1000px', mx: 'auto' }}>
      <PageHeader
        title="Μαζικό Upload"
        subtitle="Μεταφόρτωση πολλαπλών αρχείων για ένα μάθημα"
        icon={<CloudUploadIcon />}
      />

      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }} onClose={() => setSuccess('')}>{success}</Alert>}

      <Box sx={cardStyle}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                ΣΤΟΙΧΕΙΑ ΜΑΘΗΜΑΤΟΣ
            </Typography>
            <Stack spacing={2.5}>
              <TextField
                label="Εξάμηνο"
                select
                fullWidth
                value={semester}
                onChange={e => { setSemester(e.target.value); setCourse(''); }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                renderInput={(params) => (
                  <TextField {...params} label="Μάθημα" />
                )}
              />
              <TextField
                label="Έτος Εξετάσεων"
                type="number"
                fullWidth
                value={year}
                onChange={e => setYear(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
              <TextField
                label="Εξεταστική"
                select
                fullWidth
                value={period}
                onChange={e => setPeriod(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              >
                {periods.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2.5, color: 'text.secondary', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                ΑΡΧΕΙΑ ΠΡΟΣ ΜΕΤΑΦΟΡΤΩΣΗ
            </Typography>
            
            {/* Drop Zone */}
            {conversionMessage ? (
                <Box sx={{
                    p: 6, borderRadius: '20px', textAlign: 'center',
                    background: alpha(theme.palette.primary.main, 0.05),
                    border: '2px dashed', borderColor: 'primary.main',
                }}>
                    <CircularProgress size={40} sx={{ mb: 2 }} />
                    <Typography sx={{ fontWeight: 600, color: 'primary.main' }}>{conversionMessage}</Typography>
                </Box>
            ) : (
                <Box
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('bulk-upload-input').click()}
                  sx={{
                    p: 4, borderRadius: '20px', textAlign: 'center', cursor: 'pointer',
                    background: dragActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    border: '2px dashed',
                    borderColor: dragActive ? 'primary.main' : isDark ? alpha('#fff', 0.15) : alpha('#000', 0.1),
                    transition: 'all 0.25s ease',
                    '&:hover': { borderColor: 'primary.main', background: alpha(theme.palette.primary.main, 0.05) }
                  }}
                >
                  <input id="bulk-upload-input" type="file" multiple hidden accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={(e) => handleFilesSelection(e.target.files)} />
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 0.8, mb: 1.5 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, fontSize: '1rem' }}>
                    Σύρετε ή πατήστε για επιλογή
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    PDF, Word, Images (θα μετατραπούν σε PDF αυτόματα)
                  </Typography>
                </Box>
            )}

            {/* Selected Files List */}
            {files.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Επιλεγμένα: {files.length}</Typography>
                        <Button size="small" color="error" onClick={() => setFiles([])} sx={{ textTransform: 'none', fontWeight: 600 }}>Καθαρισμός</Button>
                    </Box>
                    <Stack spacing={1.2} sx={{ maxHeight: 300, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { background: alpha('#888', 0.3), borderRadius: 4 } }}>
                        {files.map((file, i) => (
                            <Box key={file.name + i} sx={{
                                p: 1.5, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 1.5,
                                background: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                                border: '1px solid', borderColor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                            }}>
                                <InsertDriveFileOutlinedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                <Typography sx={{ fontSize: '0.82rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</Typography>
                                <IconButton size="small" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} sx={{ color: 'text.secondary' }}>
                                    <DeleteIcon fontSize="inherit" />
                                </IconButton>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}

            <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !files.length || !course || !year || !period}
                onClick={handleUpload}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <DoneAllIcon />}
                sx={{ mt: 4, borderRadius: '14px', py: 1.6, fontWeight: 700, fontSize: '1rem', textTransform: 'none', boxShadow: '0 8px 24px rgba(26,115,232,0.3)' }}
              >
                {loading ? 'Γίνεται μεταφόρτωση...' : `Μεταφόρτωση ${files.length} αρχείων`}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Results Box */}
      {fileResults.length > 0 && (
          <Box sx={{ ...cardStyle, mt: 3, p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, fontSize: '1rem' }}>Αποτελέσματα Μεταφόρτωσης</Typography>
              <Stack spacing={1}>
                  {fileResults.map((res, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {res.status === 'success' ? <CheckCircleOutlineIcon sx={{ color: 'success.main', fontSize: 18 }} /> : <Tooltip title={res.message}><Icon color="error" sx={{ fontSize: 18 }}>error</Icon></Tooltip>}
                          <Typography sx={{ fontSize: '0.85rem', color: res.status === 'success' ? 'text.primary' : 'error.main' }}>
                              {res.name}: {res.status === 'success' ? 'Ολοκληρώθηκε' : 'Σφάλμα'}
                          </Typography>
                      </Box>
                  ))}
              </Stack>
          </Box>
      )}
    </Box>
  );
};

export default AdminUpload;