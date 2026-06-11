import React, { useEffect, useMemo, useState } from 'react';
import {
  Container, Typography, Box, Paper, TextField, MenuItem, Button, Stack, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip,
  useMediaQuery, useTheme, Autocomplete,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PostAddIcon from '@mui/icons-material/PostAdd';
import { supabase } from '../supabaseClient';

const periods = ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος', 'Επαναληπτική'];

const Requests = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [period, setPeriod] = useState('');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyFile, setReplyFile] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [replies, setReplies] = useState([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => current - i);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data?.session?.user || null));
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true); setError('');
      const { data: coursesData } = await supabase.from('courses').select('id,name').order('name');
      setCourses(coursesData || []);
      const { data: requestsData } = await supabase.from('file_requests')
        .select('id,course,year,period,details,created_at,status')
        .order('created_at', { ascending: false }).limit(200);
      setRequests(requestsData || []);
      setLoading(false);
    };
    run();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!course || !year || !period || !details.trim()) { setError('Συμπληρώστε όλα τα πεδία.'); return; }
    setSubmitting(true);
    const payload = { course, year: Number(year), period, details: details.trim().slice(0, 1000), status: 'open', requester: user?.id || null };
    const { error: insertError, data: inserted } = await supabase.from('file_requests').insert(payload).select('*').single();
    setSubmitting(false);
    if (insertError) { setError('Αποτυχία καταχώρησης αιτήματος.'); return; }
    setSuccess('Το αίτημά σας καταχωρήθηκε!');
    setRequests(prev => [inserted, ...prev]);
    setCourse(''); setYear(''); setPeriod(''); setDetails('');
  };

  const openReply = (req) => { setActiveRequest(req); setReplyMessage(''); setReplyFile(null); setReplyOpen(true); };

  const handleReply = async () => {
    if (!activeRequest) return;
    setError(''); setSuccess('');
    const payload = { request_id: activeRequest.id, responder: user?.id || null, message: replyMessage?.trim() || null, file_url: null };
    if (replyFile) {
      const path = `requests/${activeRequest.id}/${replyFile.name}`;
      const { error: upErr } = await supabase.storage.from('exams').upload(path, replyFile, { upsert: true, contentType: replyFile.type || 'application/octet-stream', cacheControl: '604800' });
      if (upErr) { setError('Αποτυχία ανεβάσματος αρχείου'); return; }
      const { data: pub } = supabase.storage.from('exams').getPublicUrl(path);
      payload.file_url = pub?.publicUrl || null;
    }
    const { error: insErr } = await supabase.from('file_request_replies').insert(payload);
    if (insErr) { setError('Αποτυχία αποστολής απάντησης'); return; }
    setSuccess('Η απάντηση στάλθηκε!');
    setReplyOpen(false);
  };

  const openReplies = async (req) => {
    setActiveRequest(req); setReplies([]); setRepliesLoading(true); setViewOpen(true);
    const { data, error } = await supabase.from('file_request_replies')
      .select('id,message,file_url,created_at').eq('request_id', req.id)
      .order('created_at', { ascending: false });
    if (!error) setReplies(data || []);
    setRepliesLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 2, md: 5 }, pb: { xs: 12, md: 5 } }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: '#e8f0fe', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
          <PostAddIcon sx={{ color: 'primary.main', fontSize: 28 }} />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
          Αιτήματα Αρχείων
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Ζητήστε αρχεία που δεν βρίσκονται ακόμα στη βάση
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Form */}
      <Paper sx={{ p: { xs: 2.5, sm: 3 }, mb: 4, border: '1px solid', borderColor: 'divider' }} component="form" onSubmit={handleSubmit}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <Autocomplete
            fullWidth
            options={courses.map(c => c.name)}
            value={course || null}
            onChange={(e, newValue) => setCourse(newValue || '')}
            isOptionEqualToValue={(option, value) => option === value}
            renderInput={(params) => <TextField {...params} label="Μάθημα" />}
          />
          <TextField label="Έτος" select fullWidth sx={{ maxWidth: { sm: 140 } }} value={year} onChange={e => setYear(e.target.value)}>
            {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
          </TextField>
          <TextField label="Εξεταστική" select fullWidth sx={{ maxWidth: { sm: 180 } }} value={period} onChange={e => setPeriod(e.target.value)}>
            {periods.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </TextField>
        </Stack>
        <TextField label="Λεπτομέρειες" multiline minRows={2} fullWidth sx={{ mt: 2 }} value={details} onChange={e => setDetails(e.target.value)} />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
          <Button type="submit" variant="contained" disabled={submitting} sx={{ px: 4, py: 1.2, borderRadius: 100, fontSize: '1rem', width: { xs: '100%', sm: 'auto' } }}>
            Καταχώρηση
          </Button>
        </Box>
      </Paper>

      {/* Requests list */}
      {isMobileOrTablet ? (
        <Stack spacing={1.5}>
          {(requests || []).map((r, idx) => (
            <Paper key={r.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>#{idx + 1}</Typography>
                <Chip
                  label={r.status === 'closed' ? 'Κλειστό' : 'Ανοιχτό'}
                  size="small"
                  sx={{
                    bgcolor: r.status === 'closed' ? '#e6f4ea' : '#fef7e0',
                    color: r.status === 'closed' ? '#1e8e3e' : '#e37400',
                    fontWeight: 600, fontSize: '0.7rem',
                  }}
                />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {r.course} · {r.year} · {r.period}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {r.details}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {new Date(r.created_at).toLocaleDateString('el-GR')}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <Button size="small" variant="outlined" onClick={() => openReply(r)}>Απάντηση</Button>
                  <Tooltip title="Απαντήσεις">
                    <IconButton size="small" onClick={() => openReplies(r)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                      <VisibilityIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Paper>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8fafb' }}>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary', width: 50 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Μάθημα</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Έτος</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Εξεταστική</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Λεπτομέρειες</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Κατάσταση</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Ημ/νία</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>Ενέργειες</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(requests || []).map((r, idx) => (
                <TableRow key={r.id} sx={{ '&:hover': { bgcolor: '#f8fafb' } }}>
                  <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{r.course}</TableCell>
                  <TableCell>{r.year}</TableCell>
                  <TableCell>{r.period}</TableCell>
                  <TableCell sx={{ maxWidth: 360, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.details}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.status === 'closed' ? 'Κλειστό' : 'Ανοιχτό'}
                      size="small"
                      sx={{
                        bgcolor: r.status === 'closed' ? '#e6f4ea' : '#fef7e0',
                        color: r.status === 'closed' ? '#1e8e3e' : '#e37400',
                        fontWeight: 600, fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString('el-GR')}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      <Button size="small" variant="outlined" onClick={() => openReply(r)}>Απάντηση</Button>
                      <Tooltip title="Απαντήσεις">
                        <IconButton size="small" onClick={() => openReplies(r)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                          <VisibilityIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Reply Dialog */}
      <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} fullWidth maxWidth="sm" fullScreen={isMobileOrTablet}>
        <DialogTitle sx={{ fontWeight: 700 }}>Απάντηση σε αίτημα</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            Μπορείτε να ανεβάσετε αρχείο ή/και να γράψετε μήνυμα.
          </Typography>
          <TextField label="Μήνυμα (προαιρετικό)" fullWidth multiline minRows={3} value={replyMessage} onChange={e => setReplyMessage(e.target.value)} />
          <Box sx={{ mt: 2 }}>
            <Button component="label" variant="outlined">
              Επισύναψη αρχείου
              <input type="file" hidden accept="application/pdf,image/*" onChange={e => setReplyFile(e.target.files?.[0] || null)} />
            </Button>
            {replyFile && <Typography variant="caption" sx={{ ml: 1 }}>{replyFile.name}</Typography>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyOpen(false)}>Άκυρο</Button>
          <Button variant="contained" onClick={handleReply}>Αποστολή</Button>
        </DialogActions>
      </Dialog>

      {/* Replies View Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm" fullScreen={isMobileOrTablet}>
        <DialogTitle sx={{ fontWeight: 700 }}>Απαντήσεις</DialogTitle>
        <DialogContent>
          {repliesLoading ? (
            <Typography sx={{ color: 'text.secondary' }}>Φόρτωση...</Typography>
          ) : replies.length === 0 ? (
            <Typography sx={{ color: 'text.secondary' }}>Δεν υπάρχουν απαντήσεις.</Typography>
          ) : (
            <Stack spacing={1.5}>
              {replies.map(rep => (
                <Paper key={rep.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{rep.message || '—'}</Typography>
                  {rep.file_url && (
                    <Button size="small" href={rep.file_url} target="_blank" rel="noopener noreferrer" sx={{ mt: 0.5 }}>
                      Άνοιγμα αρχείου
                    </Button>
                  )}
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                    {new Date(rep.created_at).toLocaleString('el-GR')}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewOpen(false)}>Κλείσιμο</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Requests;
