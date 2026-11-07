import React, { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import { Eye } from 'lucide-react';
import { supabase } from '../supabaseClient';

const PERIODS = ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος', 'Επαναληπτική'];

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => current - i);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data?.session?.user || null));
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      const { data: coursesData } = await supabase.from('courses').select('id, name').order('name');
      setCourses(coursesData || []);
      const { data: requestsData } = await supabase
        .from('file_requests')
        .select('id, course, year, period, details, created_at, status')
        .order('created_at', { ascending: false })
        .limit(200);
      setRequests(requestsData || []);
      setLoading(false);
    };
    run();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!course || !year || !period || !details.trim()) {
      setError('Συμπληρώστε όλα τα πεδία.');
      return;
    }
    setSubmitting(true);
    const payload = {
      course,
      year: Number(year),
      period,
      details: details.trim().slice(0, 1000),
      status: 'open',
      requester: user?.id || null,
    };
    const { error: insertError, data: inserted } = await supabase.from('file_requests').insert(payload).select('id, course, year, period, details, created_at, status').single();
    setSubmitting(false);
    if (insertError) {
      setError('Αποτυχία καταχώρησης αιτήματος.');
      return;
    }
    setSuccess('Το αίτημά σας καταχωρήθηκε!');
    setRequests((prev) => [inserted, ...prev]);
    setCourse('');
    setYear('');
    setPeriod('');
    setDetails('');
  };

  const handleReply = async () => {
    if (!activeRequest) return;
    setError('');
    setSuccess('');
    const payload = {
      request_id: activeRequest.id,
      responder: user?.id || null,
      message: replyMessage?.trim() || null,
      file_url: null,
    };
    if (replyFile) {
      const path = `requests/${activeRequest.id}/${replyFile.name}`;
      const { error: upErr } = await supabase.storage.from('exams').upload(path, replyFile, { upsert: true, contentType: replyFile.type || 'application/octet-stream', cacheControl: '604800' });
      if (upErr) {
        setError('Αποτυχία ανεβάσματος αρχείου');
        return;
      }
      const { data: pub } = supabase.storage.from('exams').getPublicUrl(path);
      payload.file_url = pub?.publicUrl || null;
    }
    const { error: insErr } = await supabase.from('file_request_replies').insert(payload);
    if (insErr) {
      setError('Αποτυχία αποστολής απάντησης');
      return;
    }
    setSuccess('Η απάντηση στάλθηκε!');
    setReplyOpen(false);
  };

  const openReplies = async (req) => {
    setActiveRequest(req);
    setReplies([]);
    setRepliesLoading(true);
    setViewOpen(true);
    const { data } = await supabase
      .from('file_request_replies')
      .select('id, message, file_url, created_at')
      .eq('request_id', req.id)
      .order('created_at', { ascending: false });
    setReplies(data || []);
    setRepliesLoading(false);
  };

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default', pb: { xs: 10, md: 6 } }}>
      <Box component="header" sx={{ width: '100%', bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider', pt: { xs: 4, sm: 6 }, pb: { xs: 4, sm: 5 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
          <Typography component="span" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'primary.main', mb: 1.5 }}>
            ΚΟΙΝΟΤΗΤΑ DSUth • ΖΗΤΗΣΕΙΣ ΥΛΙΚΟΥ
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.875rem', sm: '2.5rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 1 }}>
            Αιτήματα Αρχείων
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Ζητήστε θέματα ή σημειώσεις που δεν βρίσκονται ακόμα στην πλατφόρμα ή απαντήστε σε αιτήματα συμφοιτητών.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 }, pt: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{success}</Alert>}

        <Paper sx={{ p: { xs: 2.5, sm: 3.5 }, mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }} component="form" onSubmit={handleSubmit}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Νέο Αίτημα Υλικού</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Autocomplete
              fullWidth
              options={courses.map((c) => c.name)}
              value={course || null}
              onChange={(e, val) => setCourse(val || '')}
              renderInput={(params) => <TextField {...params} label="Μάθημα" />}
            />
            <TextField label="Έτος" select fullWidth sx={{ maxWidth: { sm: 140 } }} value={year} onChange={(e) => setYear(e.target.value)}>
              {yearOptions.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
            <TextField label="Εξεταστική" select fullWidth sx={{ maxWidth: { sm: 180 } }} value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
            </TextField>
          </Stack>
          <TextField label="Λεπτομέρειες αιτήματος" multiline minRows={2} fullWidth sx={{ mt: 2 }} value={details} onChange={(e) => setDetails(e.target.value)} />
          <Box sx={{ mt: 2.5 }}>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ minHeight: 42, px: 3, borderRadius: '8px', fontWeight: 600 }}>
              {submitting ? 'Καταχώρηση...' : 'Καταχώρηση Αιτήματος'}
            </Button>
          </Box>
        </Paper>

        {isMobile ? (
          <Stack spacing={1.5}>
            {requests.map((r, idx) => (
              <Paper key={r.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>#{idx + 1}</Typography>
                  <Chip
                    label={r.status === 'closed' ? 'Ολοκληρώθηκε' : 'Σε αναμονή'}
                    size="small"
                    sx={{
                      borderRadius: '6px',
                      bgcolor: r.status === 'closed' ? 'action.selected' : 'action.hover',
                      color: r.status === 'closed' ? 'text.secondary' : 'primary.main',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>{r.course} · {r.year} · {r.period}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>{r.details}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{new Date(r.created_at).toLocaleDateString('el-GR')}</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => { setActiveRequest(r); setReplyMessage(''); setReplyFile(null); setReplyOpen(true); }} sx={{ borderRadius: '6px', fontSize: '0.75rem' }}>Απάντηση</Button>
                    <IconButton size="small" aria-label="Προβολή απαντήσεων" onClick={() => openReplies(r)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px' }}>
                      <Eye size={16} />
                    </IconButton>
                  </Stack>
                </Box>
              </Paper>
            ))}
          </Stack>
        ) : (
          <TableContainer component={Paper} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 700, width: 50 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Μάθημα</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Έτος</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Εξεταστική</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Λεπτομέρειες</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Κατάσταση</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ημερομηνία</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Ενέργειες</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((r, idx) => (
                  <TableRow key={r.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell sx={{ color: 'text.secondary' }}>{idx + 1}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{r.course}</TableCell>
                    <TableCell>{r.year}</TableCell>
                    <TableCell>{r.period}</TableCell>
                    <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.details}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.status === 'closed' ? 'Ολοκληρώθηκε' : 'Σε αναμονή'}
                        size="small"
                        sx={{
                          borderRadius: '6px',
                          bgcolor: r.status === 'closed' ? 'action.selected' : 'action.hover',
                          color: r.status === 'closed' ? 'text.secondary' : 'primary.main',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString('el-GR')}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => { setActiveRequest(r); setReplyMessage(''); setReplyFile(null); setReplyOpen(true); }} sx={{ borderRadius: '6px' }}>Απάντηση</Button>
                        <IconButton size="small" aria-label="Προβολή απαντήσεων" onClick={() => openReplies(r)} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '6px' }}>
                          <Eye size={16} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>Απάντηση σε Αίτημα</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>Επισυνάψτε αρχείο ή γράψτε μήνυμα προς τον φοιτητή.</Typography>
            <TextField label="Μήνυμα" fullWidth multiline minRows={3} value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} />
            <Box sx={{ mt: 2 }}>
              <Button component="label" variant="outlined" sx={{ borderRadius: '8px' }}>
                Επισύναψη αρχείου
                <input type="file" hidden accept="application/pdf,image/*" onChange={(e) => setReplyFile(e.target.files?.[0] || null)} />
              </Button>
              {replyFile && <Typography variant="caption" sx={{ ml: 1.5, color: 'text.secondary' }}>{replyFile.name}</Typography>}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setReplyOpen(false)} sx={{ borderRadius: '8px' }}>Ακύρωση</Button>
            <Button variant="contained" onClick={handleReply} sx={{ borderRadius: '8px' }}>Αποστολή</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '12px', p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>Απαντήσεις Αιτήματος</DialogTitle>
          <DialogContent>
            {repliesLoading ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Φόρτωση απαντήσεων...</Typography>
            ) : replies.length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Δεν υπάρχουν ακόμα απαντήσεις.</Typography>
            ) : (
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                {replies.map((rep) => (
                  <Paper key={rep.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
                    {rep.message && <Typography variant="body2" sx={{ mb: 1 }}>{rep.message}</Typography>}
                    {rep.file_url && (
                      <Button size="small" variant="outlined" href={rep.file_url} target="_blank" sx={{ borderRadius: '6px' }}>
                        Άνοιγμα Αρχείου
                      </Button>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setViewOpen(false)} sx={{ borderRadius: '8px' }}>Κλείσιμο</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Requests;
