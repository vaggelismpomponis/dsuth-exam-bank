import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem, Button, Alert, CircularProgress,
  Stack, Autocomplete, useTheme, useMediaQuery, alpha, IconButton, Tooltip, Chip,
} from '@mui/material';
import CloudUploadIcon           from '@mui/icons-material/CloudUpload';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import DeleteOutlineIcon         from '@mui/icons-material/DeleteOutline';
import DoneAllIcon               from '@mui/icons-material/DoneAll';
import CheckCircleOutlineIcon    from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon          from '@mui/icons-material/ErrorOutline';
import { supabase }      from '../../supabaseClient';
import { convertToPdf }  from '../../utils/pdfConversion';

const PERIODS = ['Ιανουάριος','Ιούνιος','Σεπτέμβριος','Επαναληπτική'];

function greekToLatin(str) {
  const map = {
    'Α':'A','Β':'V','Γ':'G','Δ':'D','Ε':'E','Ζ':'Z','Η':'I','Θ':'Th','Ι':'I','Κ':'K','Λ':'L','Μ':'M','Ν':'N','Ξ':'X','Ο':'O','Π':'P','Ρ':'R','Σ':'S','Τ':'T','Υ':'Y','Φ':'F','Χ':'Ch','Ψ':'Ps','Ω':'O',
    'ά':'a','έ':'e','ή':'i','ί':'i','ό':'o','ύ':'y','ώ':'o','ς':'s','ϊ':'i','ΰ':'y','ϋ':'y','ΐ':'i',
    'α':'a','β':'v','γ':'g','δ':'d','ε':'e','ζ':'z','η':'i','θ':'th','ι':'i','κ':'k','λ':'l','μ':'m','ν':'n','ξ':'x','ο':'o','π':'p','ρ':'r','σ':'s','τ':'t','υ':'y','φ':'f','χ':'ch','ψ':'ps','ω':'o',
    'Ά':'A','Έ':'E','Ή':'I','Ί':'I','Ό':'O','Ύ':'Y','Ώ':'O','Ϊ':'I','Ϋ':'Y',
  };
  return str.split('').map(l => map[l] ?? l).join('').replace(/[^a-zA-Z0-9]/g,'');
}

const AdminUpload = () => {
  const theme   = useTheme();
  const dark    = theme.palette.mode === 'dark';

  const [user,          setUser]         = useState(null);
  const [courses,       setCourses]      = useState([]);
  const [coursesLoad,   setCoursesLoad]  = useState(true);
  const [semester,      setSemester]     = useState('');
  const [course,        setCourse]       = useState('');
  const [year,          setYear]         = useState('');
  const [period,        setPeriod]       = useState('');
  const [files,         setFiles]        = useState([]);
  const [converting,    setConverting]   = useState('');
  const [uploading,     setUploading]    = useState(false);
  const [results,       setResults]      = useState([]);   // [{name,ok,msg}]
  const [alert,         setAlert]        = useState({ type:'', msg:'' });
  const [drag,          setDrag]         = useState(false);

  const notify = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert({ type:'', msg:'' }), 5000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data?.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setCoursesLoad(true);
    supabase.from('courses').select('*').order('name').then(({ data }) => {
      setCourses(data ?? []);
      setCoursesLoad(false);
    });
  }, []);

  const semesterCourses = semester ? courses.filter(c => c.semester === Number(semester)) : [];

  /* ── File selection & conversion ── */
  const processFiles = async (list) => {
    const arr = Array.from(list).filter(f =>
      ['application/pdf','application/msword',
       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
       'image/png','image/jpeg'].includes(f.type)
    );
    if (!arr.length) return;
    const out = [];
    for (let i = 0; i < arr.length; i++) {
      setConverting(`[${i+1}/${arr.length}] Μετατροπή: ${arr[i].name}…`);
      out.push(await convertToPdf(arr[i], () => {}));
    }
    setConverting('');
    setFiles(prev => {
      const names = new Set(prev.map(f => f.name));
      return [...prev, ...out.filter(f => !names.has(f.name))];
    });
  };

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
  };

  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  /* ── Upload ── */
  const handleUpload = async () => {
    if (!course || !year || !period || !files.length) {
      notify('error', 'Συμπλήρωσε όλα τα πεδία και επίλεξε τουλάχιστον ένα αρχείο.');
      return;
    }
    setUploading(true); setResults([]);
    const rs = [];
    for (let i = 0; i < files.length; i++) {
      const f    = files[i];
      const name = `${greekToLatin(course)}_${year}_${greekToLatin(period)}_${i+1}_${Date.now()}.pdf`;
      const { error: se } = await supabase.storage.from('exams').upload(name, f);
      if (se) { rs.push({ name: f.name, ok: false, msg: se.message }); continue; }
      const { data: { publicUrl } } = supabase.storage.from('exams').getPublicUrl(name);
      const { error: de } = await supabase.from('exams').insert([{
        course, year: +year, period,
        uploader: user?.id ?? 'admin',
        file_url: publicUrl, approved: true,
      }]);
      rs.push(de
        ? { name: f.name, ok: false, msg: de.message }
        : { name: f.name, ok: true,  msg: 'Ολοκληρώθηκε' }
      );
    }
    setResults(rs);
    const allOk = rs.every(r => r.ok);
    notify(allOk ? 'success' : 'error', allOk
      ? `${rs.length} αρχεία ανέβηκαν επιτυχώς!`
      : 'Κάποια αρχεία δεν ανέβηκαν.'
    );
    if (allOk) { setFiles([]); setCourse(''); setYear(''); setPeriod(''); setSemester(''); }
    setUploading(false);
  };

  /* ── Styles ── */
  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' }, width: '100%' };
  const sectionBox = {
    p: { xs: 2.5, sm: 3.5 },
    borderRadius: '18px',
    background: dark ? alpha('#fff', 0.04) : '#fff',
    border: '1px solid',
    borderColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
    boxShadow: dark ? 'none' : '0 2px 12px rgba(0,0,0,.04)',
  };

  const canUpload = !uploading && !converting && files.length > 0 && course && year && period;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.75 }}>
        <Box sx={{
          width: 44, height: 44, borderRadius: '13px',
          background: 'linear-gradient(135deg,#1a73e8,#0052cc)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(26,115,232,.35)',
        }}>
          <CloudUploadIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.15, fontSize: { xs: '1.35rem', sm: '1.7rem' } }}>
            Μαζικό Upload
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2, fontSize: '0.82rem' }}>
            Μεταφόρτωση πολλαπλών αρχείων για ένα μάθημα
          </Typography>
        </Box>
      </Box>

      {alert.msg && (
        <Alert severity={alert.type} sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setAlert({ type:'', msg:'' })}>
          {alert.msg}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr' }, gap: 3 }}>

        {/* ── Left: form ── */}
        <Box sx={sectionBox}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.7rem', color: 'text.secondary', letterSpacing: '0.09em', textTransform: 'uppercase', mb: 2.5 }}>
            Στοιχεία Αρχείου
          </Typography>
          <Stack spacing={2.5}>
            <TextField label="Εξάμηνο" select value={semester}
              onChange={e => { setSemester(e.target.value); setCourse(''); }} sx={fieldSx}>
              {[...Array(8)].map((_, i) => (
                <MenuItem key={i+1} value={i+1}>{i+1}ο Εξάμηνο</MenuItem>
              ))}
            </TextField>

            <Autocomplete
              options={semesterCourses.map(c => c.name)}
              value={course || null}
              onChange={(_, v) => setCourse(v ?? '')}
              disabled={!semester || coursesLoad || semesterCourses.length === 0}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              renderInput={params => (
                <TextField {...params} label="Μάθημα"
                  helperText={!semester ? 'Επίλεξε πρώτα εξάμηνο' : semesterCourses.length === 0 ? 'Δεν υπάρχουν μαθήματα' : ''} />
              )}
            />

            <TextField label="Έτος" type="number" value={year}
              onChange={e => setYear(e.target.value)}
              inputProps={{ min: 2000, max: 2099 }} sx={fieldSx} />

            <TextField label="Εξεταστική" select value={period}
              onChange={e => setPeriod(e.target.value)} sx={fieldSx}>
              {PERIODS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          </Stack>
        </Box>

        {/* ── Right: drop zone + files ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={sectionBox}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.7rem', color: 'text.secondary', letterSpacing: '0.09em', textTransform: 'uppercase', mb: 2.5 }}>
              Αρχεία ({files.length})
            </Typography>

            {/* Drop zone */}
            {converting ? (
              <Box sx={{
                p: 5, borderRadius: '14px', textAlign: 'center',
                border: '2px dashed', borderColor: 'primary.main',
                background: alpha(theme.palette.primary.main, 0.05),
              }}>
                <CircularProgress size={36} sx={{ mb: 2 }} />
                <Typography sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.875rem' }}>{converting}</Typography>
              </Box>
            ) : (
              <Box
                onDragEnter={e => { e.preventDefault(); setDrag(true); }}
                onDragOver={e  => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={onDrop}
                onClick={() => document.getElementById('_admin_upload_input').click()}
                sx={{
                  p: 4, borderRadius: '14px', textAlign: 'center', cursor: 'pointer',
                  border: '2px dashed',
                  borderColor: drag ? 'primary.main' : dark ? alpha('#fff', 0.15) : alpha('#000', 0.12),
                  background: drag ? alpha(theme.palette.primary.main, 0.07) : 'transparent',
                  transition: 'all .2s',
                  '&:hover': { borderColor: 'primary.main', background: alpha(theme.palette.primary.main, 0.05) },
                }}
              >
                <input
                  id="_admin_upload_input" type="file" multiple hidden
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={e => { if (e.target.files?.length) processFiles(e.target.files); e.target.value = null; }}
                />
                <CloudUploadIcon sx={{ fontSize: 44, color: 'primary.main', opacity: 0.75, mb: 1.5 }} />
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', mb: 0.5 }}>
                  Σύρετε αρχεία εδώ ή κάντε κλικ
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  PDF, Word, PNG, JPG — αυτόματη μετατροπή σε PDF
                </Typography>
              </Box>
            )}

            {/* File list */}
            {files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
                    {files.length} αρχεία επιλεγμένα
                  </Typography>
                  <Button size="small" color="error" onClick={() => setFiles([])}
                    sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', fontSize: '0.75rem' }}>
                    Καθαρισμός
                  </Button>
                </Box>
                <Stack spacing={1} sx={{
                  maxHeight: 220, overflowY: 'auto', pr: 0.5,
                  '&::-webkit-scrollbar': { width: 4 },
                  '&::-webkit-scrollbar-thumb': { background: alpha('#888', 0.3), borderRadius: 4 },
                }}>
                  {files.map((f, i) => (
                    <Box key={f.name + i} sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.1,
                      borderRadius: '10px',
                      background: dark ? alpha('#fff', 0.035) : alpha('#000', 0.025),
                      border: '1px solid',
                      borderColor: dark ? alpha('#fff', 0.06) : alpha('#000', 0.06),
                    }}>
                      <InsertDriveFileOutlinedIcon sx={{ color: 'primary.main', fontSize: 18, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.8rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {f.name}
                      </Typography>
                      <Tooltip title="Αφαίρεση" disableInteractive>
                        <IconButton size="small" onClick={() => removeFile(i)} sx={{ color: 'text.secondary', p: 0.3 }}>
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>

          {/* Upload button */}
          <Button
            variant="contained"
            fullWidth
            disabled={!canUpload}
            onClick={handleUpload}
            size="large"
            startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <DoneAllIcon />}
            sx={{
              borderRadius: '13px', py: 1.7, fontWeight: 800, fontSize: '0.975rem',
              textTransform: 'none',
              boxShadow: canUpload ? '0 8px 24px rgba(26,115,232,.3)' : 'none',
              letterSpacing: '-0.01em',
            }}
          >
            {uploading ? 'Μεταφόρτωση…' : `Μεταφόρτωση ${files.length > 0 ? files.length + ' αρχείων' : ''}`}
          </Button>

          {/* Results */}
          {results.length > 0 && (
            <Box sx={sectionBox}>
              <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', mb: 1.5 }}>
                Αποτελέσματα
              </Typography>
              <Stack spacing={0.75}>
                {results.map((r, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    {r.ok
                      ? <CheckCircleOutlineIcon sx={{ fontSize: 17, color: '#1e8e3e', flexShrink: 0 }} />
                      : <ErrorOutlineIcon       sx={{ fontSize: 17, color: '#d32f2f', flexShrink: 0 }} />}
                    <Typography sx={{ fontSize: '0.82rem', color: r.ok ? 'text.primary' : 'error.main', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {r.name}
                    </Typography>
                    {!r.ok && (
                      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', flexShrink: 0 }}>
                        {r.msg}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminUpload;