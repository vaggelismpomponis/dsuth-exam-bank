import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, CardActions, Button, Skeleton, Stack, Alert, Tooltip, Avatar, useTheme, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useMediaQuery } from '@mui/material';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import PersonIcon from '@mui/icons-material/Person';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { supabase } from '../supabaseClient';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c';

const CourseFiles = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploaders, setUploaders] = useState({});
  const [downloadingAll, setDownloadingAll] = useState(false);
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery('(max-width:899px)');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      // Fetch course
      const { data: courseData, error: courseError } = await supabase.from('courses').select('*').eq('id', id).single();
      if (courseError) { setError('Σφάλμα ανάκτησης μαθήματος'); setLoading(false); return; }
      setCourse(courseData);
      // Fetch files
      let query = supabase.from('exams').select('*').eq('course', courseData.name).order('created_at', { ascending: false });
      if (!user || user.id !== ADMIN_UID) query = query.eq('approved', true);
      const { data: filesData, error: filesError } = await query;
      if (filesError) { setError('Σφάλμα ανάκτησης αρχείων'); setLoading(false); return; }
      setFiles(filesData);
      // Fetch uploader names
      const uploaderIds = [...new Set((filesData || []).map(f => f.uploader).filter(Boolean))];
      if (uploaderIds.length > 0) {
        const { data: uploaderProfiles } = await supabase.from('profiles').select('id,first_name,last_name,email').in('id', uploaderIds);
        if (uploaderProfiles) {
          const map = {};
          uploaderProfiles.forEach(u => {
            map[u.id] = (u.first_name || u.last_name)
              ? `${u.first_name || ''} ${u.last_name || ''}`.trim()
              : (u.email || u.id);
          });
          setUploaders(map);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  // Scroll to top immediately when route changes (id changes)
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [id]);

  // Scroll to top after data is loaded (try all possible roots)
  useEffect(() => {
    if (!loading) {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [loading]);

  const handleApprove = async (fileId) => {
    setError(''); setSuccess('');
    const { error } = await supabase.from('exams').update({ approved: true }).eq('id', fileId);
    if (error) setError('Σφάλμα έγκρισης: ' + error.message);
    else { setSuccess('Εγκρίθηκε!'); setFiles(files => files.map(f => f.id === fileId ? { ...f, approved: true } : f)); }
  };
  const handleDelete = async (fileId, file_url) => {
    setError(''); setSuccess('');
    // Διαγραφή από storage
    const filePath = file_url.split('/exams/')[1];
    if (filePath) {
      await supabase.storage.from('exams').remove([filePath]);
    }
    // Διαγραφή από DB
    const { error } = await supabase.from('exams').delete().eq('id', fileId);
    if (error) setError('Σφάλμα διαγραφής: ' + error.message);
    else { setSuccess('Διαγράφηκε!'); setFiles(files => files.filter(f => f.id !== fileId)); }
  };

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    const zip = new JSZip();
    // Προσθέτουμε κάθε αρχείο στο zip
    await Promise.all(files.map(async (file) => {
      try {
        const response = await fetch(file.file_url);
        const blob = await response.blob();
        // Όνομα αρχείου: <course>_<year>_<period>_<id>.pdf
        const safeCourse = (course?.name || 'file').replace(/[^a-zA-Z0-9_\-]/g, '_');
        const filename = `${safeCourse}_${file.year}_${file.period}_${file.id}.pdf`;
        zip.file(filename, blob);
      } catch (e) {}
    }));
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${course?.name || 'files'}.zip`);
    setDownloadingAll(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        variant="outlined"
        color="primary"
        onClick={() => window.history.length > 1 ? window.history.back() : window.location.assign('/courses')}
        sx={{ mb: 2, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
      >
        Πίσω
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleDownloadAll}
        disabled={files.length === 0 || downloadingAll}
        sx={{ mb: 2, ml: 1, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
      >
        {downloadingAll ? 'Δημιουργία zip...' : 'Κατέβασμα όλων σε zip'}
      </Button>
      {course && <Typography variant="h5" color="#222" gutterBottom align="center" sx={{ fontWeight: 700 }}>{course.name} (Εξάμηνο {course.semester})</Typography>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {loading ? (
        <Stack spacing={2}>
          {[1,2].map(i => <Skeleton key={i} variant="rounded" height={110} />)}
        </Stack>
      ) : files.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <SentimentDissatisfiedIcon color="disabled" sx={{ fontSize: 60, mb: 1 }} />
          <Typography variant="h6" color="#222">Δεν υπάρχουν αρχεία για αυτό το μάθημα.</Typography>
        </Box>
      ) : isMobileOrTablet ? (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {files.map(file => (
            <Box key={file.id} sx={{ background: '#f8fafc', boxShadow: '0 2px 12px 0 rgba(31,38,135,0.08)', borderRadius: '18px', border: '1px solid #e3eafc', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Έτος: <span style={{ fontWeight: 400 }}>{file.year}</span></Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Εξεταστική: <span style={{ fontWeight: 400 }}>{file.period}</span></Typography>
              <Box sx={{ mt: 1 }}>
                <Button color="info" size="small" href={file.file_url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', background: '#e3f2fd', borderRadius: 1, '&:hover': { background: '#bbdefb' }, mr: 1 }}><VisibilityIcon /></Button>
                <Button color="primary" size="small" href={file.file_url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', background: '#e3eafc', borderRadius: 1, '&:hover': { background: '#c5cae9' }, mr: 1 }}><DownloadIcon /></Button>
                {user && user.id === ADMIN_UID && !file.approved && (
                  <Button variant="outlined" color="success" onClick={() => handleApprove(file.id)} size="small" sx={{ borderRadius: 1, mr: 1 }}><CheckIcon /></Button>
                )}
                {user && user.id === ADMIN_UID && (
                  <Button variant="outlined" color="error" onClick={() => handleDelete(file.id, file.file_url)} size="small" sx={{ borderRadius: 1 }}><DeleteIcon /></Button>
                )}
              </Box>
            </Box>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ background: '#f8fafc', boxShadow: '0 2px 12px 0 rgba(31,38,135,0.08)', borderRadius: '18px', border: '1px solid #e3eafc', mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Έτος</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Εξεταστική</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Ενέργειες</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map(file => (
                <TableRow key={file.id}>
                  <TableCell>{file.year}</TableCell>
                  <TableCell>{file.period}</TableCell>
                  <TableCell>
                    <Box sx={{
                      bgcolor: file.approved ? 'success.main' : 'warning.main',
                      color: '#fff',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: 13,
                      letterSpacing: 0.5,
                      boxShadow: 1,
                      display: 'inline-block',
                    }}>
                      {file.approved ? 'Εγκεκριμένο' : 'Αναμονή έγκρισης'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button color="info" size="small" href={file.file_url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', background: '#e3f2fd', borderRadius: 1, '&:hover': { background: '#bbdefb' }, mr: 1 }}><VisibilityIcon /></Button>
                    <Button color="primary" size="small" href={file.file_url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', background: '#e3eafc', borderRadius: 1, '&:hover': { background: '#c5cae9' }, mr: 1 }}><DownloadIcon /></Button>
                    {user && user.id === ADMIN_UID && !file.approved && (
                      <Button variant="outlined" color="success" onClick={() => handleApprove(file.id)} size="small" sx={{ borderRadius: 1, mr: 1 }}><CheckIcon /></Button>
                    )}
                    {user && user.id === ADMIN_UID && (
                      <Button variant="outlined" color="error" onClick={() => handleDelete(file.id, file.file_url)} size="small" sx={{ borderRadius: 1 }}><DeleteIcon /></Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default CourseFiles; 