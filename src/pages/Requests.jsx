import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { supabase } from '../supabaseClient';

const periods = ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος', 'Επαναληπτική'];

const Requests = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
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
    const arr = [];
    for (let y = current; y >= current - 10; y -= 1) arr.push(y);
    return arr;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data?.session?.user || null));
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      // fetch courses
      const { data: coursesData } = await supabase.from('courses').select('id,name').order('name');
      setCourses(coursesData || []);
      // fetch latest requests
      const { data: requestsData } = await supabase
        .from('file_requests')
        .select('id,course,year,period,details,created_at,status')
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
    const { error: insertError, data: inserted } = await supabase
      .from('file_requests')
      .insert(payload)
      .select('*')
      .single();
    setSubmitting(false);
    if (insertError) {
      setError('Αποτυχία καταχώρησης αιτήματος. Ελέγξτε ότι υπάρχει ο πίνακας file_requests.');
      return;
    }
    setSuccess('Το αίτημά σας καταχωρήθηκε!');
    setRequests((prev) => [inserted, ...prev]);
    setCourse('');
    setYear('');
    setPeriod('');
    setDetails('');
  };

  const openReply = (req) => {
    setActiveRequest(req);
    setReplyMessage('');
    setReplyFile(null);
    setReplyOpen(true);
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
    // Optional file upload under exams bucket at requests/<requestId>/filename
    if (replyFile) {
      const path = `requests/${activeRequest.id}/${replyFile.name}`;
      const { error: upErr } = await supabase.storage
        .from('exams')
        .upload(path, replyFile, { upsert: true, contentType: replyFile.type || 'application/octet-stream' });
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
    setActiveRequest(req);
    setReplies([]);
    setRepliesLoading(true);
    setViewOpen(true);
    const { data, error } = await supabase
      .from('file_request_replies')
      .select('id,message,file_url,created_at')
      .eq('request_id', req.id)
      .order('created_at', { ascending: false });
    if (!error) setReplies(data || []);
    setRepliesLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, textAlign: 'center', mb: 3, color: '#222' }}>
        Αιτήματα Αρχείων
      </Typography>
      <Typography variant="body1" sx={{ color: '#444', mb: 2, textAlign: 'center' }}>
        Ζητήστε ένα αρχείο που δεν βρίσκεται στη βάση. Οι συμφοιτητές σας μπορούν να βοηθήσουν.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 2.5, borderRadius: 2, boxShadow: '0 2px 12px 0 rgba(31,38,135,0.08)', border: '1px solid #e3eafc', mb: 4 }} component="form" onSubmit={handleSubmit}>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
          <TextField
            label="Μάθημα"
            select
            fullWidth
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            helperText="Επιλέξτε μάθημα"
          >
            {courses.map((c) => (
              <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Έτος"
            select
            sx={{ minWidth: 140 }}
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            {yearOptions.map((y) => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Εξεταστική"
            select
            sx={{ minWidth: 170 }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {periods.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </TextField>
        </Stack>
        <TextField
          label="Λεπτομέρειες (π.χ. αν είναι Α/Β θέματα, καθηγητής, εξτρά σημειώσεις)"
          multiline
          minRows={3}
          fullWidth
          sx={{ mt: 2 }}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button type="submit" variant="contained" disabled={submitting} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Καταχώρηση αιτήματος
          </Button>
        </Box>
      </Paper>

      {isMobileOrTablet ? (
        <Stack spacing={2}>
          {(requests || []).map((r, idx) => (
            <Paper key={r.id} sx={{ p: 2, borderRadius: 2, border: '1px solid #e3eafc' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#222' }}>#{idx + 1}</Typography>
                <Chip label={r.status === 'closed' ? 'Κλειστό' : 'Ανοιχτό'} color={r.status === 'closed' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 700 }} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Μάθημα: <Typography component="span" sx={{ fontWeight: 400 }}>{r.course}</Typography></Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Έτος: <Typography component="span" sx={{ fontWeight: 400 }}>{r.year}</Typography></Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Εξεταστική: <Typography component="span" sx={{ fontWeight: 400 }}>{r.period}</Typography></Typography>
              <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.details}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{new Date(r.created_at).toLocaleDateString('el-GR')}</Typography>
                <Stack direction="row" spacing={1}>
                  <Button size="small" variant="outlined" onClick={() => openReply(r)} sx={{ borderRadius: 2 }}>Απάντηση</Button>
                  <Tooltip title="Προβολή απαντήσεων">
                    <IconButton size="small" onClick={() => openReplies(r)} aria-label="Προβολή απαντήσεων">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            </Paper>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ background: '#f8fafc', boxShadow: '0 2px 12px 0 rgba(31,38,135,0.08)', borderRadius: '18px', border: '1px solid #e3eafc' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#222' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222' }}>Μάθημα</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222' }}>Έτος</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222' }}>Εξεταστική</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222' }}>Λεπτομέρειες</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222' }}>Κατάσταση</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222' }}>Ημ/νία</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#222' }}>Ενέργειες</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(requests || []).map((r, idx) => (
                <TableRow key={r.id}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{r.course}</TableCell>
                  <TableCell>{r.year}</TableCell>
                  <TableCell>{r.period}</TableCell>
                  <TableCell sx={{ maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.details}</TableCell>
                  <TableCell>
                    <Chip label={r.status === 'closed' ? 'Κλειστό' : 'Ανοιχτό'} color={r.status === 'closed' ? 'success' : 'warning'} size="small" sx={{ fontWeight: 700 }} />
                  </TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString('el-GR')}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button size="small" variant="outlined" onClick={() => openReply(r)} sx={{ borderRadius: 2 }}>Απάντηση</Button>
                      <Tooltip title="Προβολή απαντήσεων">
                        <IconButton size="small" onClick={() => openReplies(r)} aria-label="Προβολή απαντήσεων">
                          <VisibilityIcon fontSize="small" />
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

      <Dialog open={replyOpen} onClose={() => setReplyOpen(false)} fullWidth maxWidth="sm" fullScreen={isMobileOrTablet}>
        <DialogTitle>Απάντηση σε αίτημα</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
            Μπορείτε να ανεβάσετε αρχείο και/ή να γράψετε ένα μήνυμα προς τον αιτούντα.
          </Typography>
          <TextField
            label="Μήνυμα (προαιρετικό)"
            fullWidth
            multiline
            minRows={3}
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
          />
          <Box sx={{ mt: 2 }}>
            <Button component="label" variant="outlined" sx={{ borderRadius: 2 }}>
              Επισύναψη αρχείου
              <input type="file" hidden accept="application/pdf,image/*" onChange={(e) => setReplyFile(e.target.files?.[0] || null)} />
            </Button>
            {replyFile && (
              <Typography variant="caption" sx={{ ml: 1 }}>{replyFile.name}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyOpen(false)}>Άκυρο</Button>
          <Button variant="contained" onClick={handleReply}>Αποστολή</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm" fullScreen={isMobileOrTablet}>
        <DialogTitle>Απαντήσεις</DialogTitle>
        <DialogContent>
          {repliesLoading ? (
            <Typography sx={{ color: 'text.secondary' }}>Φόρτωση...</Typography>
          ) : replies.length === 0 ? (
            <Typography sx={{ color: 'text.secondary' }}>Δεν υπάρχουν απαντήσεις ακόμη.</Typography>
          ) : (
            <Stack spacing={1.5}>
              {replies.map((rep) => (
                <Paper key={rep.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid #e3eafc' }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{rep.message || '—'}</Typography>
                  {rep.file_url && (
                    <Box sx={{ mt: 0.5 }}>
                      <Button size="small" href={rep.file_url} target="_blank" rel="noopener noreferrer" sx={{ borderRadius: 2 }}>
                        Άνοιγμα αρχείου
                      </Button>
                    </Box>
                  )}
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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


