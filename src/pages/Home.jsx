import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, Paper, Stack, Skeleton, IconButton } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { supabase } from '../supabaseClient';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HelpIcon from '@mui/icons-material/Help';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';

const Home = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (!error) setExams(data);
      setLoading(false);
    };
    fetchExams();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  useEffect(() => {
    if (localStorage.getItem('googleLoginSuccess')) {
      enqueueSnackbar('Επιτυχής είσοδος με Google!', { variant: 'success' });
      localStorage.removeItem('googleLoginSuccess');
    }
  }, []);

  /* ── Feature cards data ── */
  const features = [
    { icon: <UploadFileIcon />, title: 'Ανέβασμα Αρχείων', desc: 'Προσθέστε θέματα εξετάσεων για να βοηθήσετε την κοινότητα', href: '/upload', color: '#1a73e8' },
    { icon: <HelpIcon />, title: 'Αίτηση Αρχείων', desc: 'Ζητήστε αρχεία που δεν βρίσκονται στην πλατφόρμα', href: '/requests', color: '#ea8600' },
    { icon: <MenuBookIcon />, title: 'Μαθήματα', desc: 'Εξερευνήστε όλα τα μαθήματα και τα αρχεία τους', href: '/courses', color: '#1e8e3e' },
    { icon: <FavoriteIcon />, title: 'Αγαπημένα', desc: 'Αποθηκεύστε μαθήματα για γρήγορη πρόσβαση', href: '/favorites', color: '#d93025' },
    { icon: <PersonIcon />, title: 'Προφίλ', desc: 'Διαχειριστείτε τον λογαριασμό σας', href: '/profile', color: '#e37400' },
    { icon: <QuestionAnswerIcon />, title: 'Επικοινωνία', desc: 'Στείλτε μας τις απορίες σας', href: '/contact', color: '#1a73e8' },
  ];

  return (
    <Box sx={{
      width: '100vw',
      minHeight: '100vh',
      bgcolor: 'background.default',
      overflowX: 'hidden',
      pb: { xs: 10, md: 0 },
    }}>
      {/* ── Container ── */}
      <Box sx={{ maxWidth: 800, mx: 'auto', px: { xs: 2.5, md: 4 }, pt: { xs: 2.5, md: 5 } }}>

        {/* Mobile Title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, display: { md: 'none' }, color: 'text.primary' }}>
          DSUth Exam Bank
        </Typography>

        {/* ── Hero Card ── */}
        <Paper
          sx={{
            bgcolor: theme.palette.mode === 'light' ? '#1a73e8' : 'background.paper',
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            color: '#fff',
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative circle */}
          <Box sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.08)',
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -60,
            left: -20,
            width: 120,
            height: 120,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)',
          }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, fontSize: { xs: '1.4rem', md: '1.6rem' } }}>
              Τράπεζα Θεμάτων
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mb: 3, fontSize: '0.95rem' }}>
              Παλιά θέματα & Σημειώσεις — Ψηφιακά Συστήματα UTH
            </Typography>

            <Stack direction="row" spacing={2}>
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                borderRadius: 3,
                p: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <Typography variant="caption" sx={{ opacity: 0.75, display: 'block', fontSize: '0.75rem' }}>
                  Θέματα
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  150+
                </Typography>
              </Box>
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(8px)',
                borderRadius: 3,
                p: 2,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <Typography variant="caption" sx={{ opacity: 0.75, display: 'block', fontSize: '0.75rem' }}>
                  Συνεισφέροντες
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  25
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* ── Recent Files ── */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.1rem' }}>
              Πρόσφατα Αρχεία
            </Typography>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              onClick={() => navigate('/courses')}
              sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.8rem' }}
            >
              Όλα
            </Button>
          </Box>

          {loading ? (
            <Stack spacing={1.5}>
              {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={68} />)}
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              {exams.map((exam) => (
                <Paper
                  key={exam.id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'box-shadow 0.15s, transform 0.15s',
                    cursor: 'default',
                    '&:hover': {
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{
                      minWidth: 44,
                      height: 44,
                      borderRadius: 2.5,
                      bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.palette.mode === 'light' ? '#1a73e8' : '#8ab4f8',
                    }}>
                      <DescriptionIcon sx={{ fontSize: 22 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {exam.course || 'Άγνωστο Μάθημα'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ fontSize: '0.8rem' }}>
                        {exam.year} {exam.period}
                      </Typography>
                    </Box>
                  </Stack>

                  <IconButton
                    onClick={() => {
                      const url = exam.file_url?.trim().replace(/\?$/, '') || '';
                      const filename = url.split('/').pop().split('?')[0];
                      const params = new URLSearchParams({
                        url,
                        name: filename,
                        course: exam.courses?.name || '',
                        period: exam.period || '',
                        year: String(exam.year || ''),
                      });
                      navigate(`/viewer?${params.toString()}`);
                    }}
                    size="small"
                    sx={{
                      ml: 1,
                      color: 'text.secondary',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2.5,
                      width: 38,
                      height: 38,
                      '&:hover': { bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'rgba(255,255,255,0.08)', color: theme.palette.mode === 'light' ? 'primary.main' : '#8ab4f8', borderColor: theme.palette.mode === 'light' ? 'primary.light' : 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    <VisibilityIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      {/* ── CTA Band ── */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'background.paper',
          py: { xs: 5, md: 6 },
          px: { xs: 3, md: 4 },
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          Έχεις παλιά θέματα;
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary', maxWidth: 480, mx: 'auto', fontSize: '0.95rem' }}>
          Βοήθησε την κοινότητα στέλνοντας τα δικά σου αρχεία. Η γνώση ανήκει σε όλους.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<UploadFileIcon />}
          href="/upload"
          sx={{ px: 4, py: 1.5 }}
        >
          Ανέβασε αρχείο
        </Button>
      </Box>

      {/* ── Features Grid ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 }, px: { xs: 3, md: 5 } }}>
        <Typography variant="h5" align="center" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
          Δυνατότητες
        </Typography>
        <Typography align="center" sx={{ mb: 5, color: 'text.secondary', maxWidth: 500, mx: 'auto', fontSize: '0.95rem' }}>
          Ανακαλύψτε τις δυνατότητες της πλατφόρμας
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2.5,
          }}
        >
          {features.map((f) => (
            <Paper
              key={f.title}
              onClick={() => navigate(f.href)}
              sx={{
                p: 3,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  borderColor: f.color,
                  boxShadow: `0 4px 20px ${f.color}15`,
                  transform: 'translateY(-3px)',
                },
              }}
            >
              <Box sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                bgcolor: `${f.color}10`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                color: f.color,
                '& svg': { fontSize: 26 },
              }}>
                {f.icon}
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                {f.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {f.desc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* ── Credits / Sources ── */}
      <Container maxWidth="md" sx={{ pb: { xs: 5, md: 7 }, px: { xs: 3, md: 3 } }}>
        <Paper sx={{ p: 2.5, borderRadius: 3, bgcolor: theme.palette.mode === 'light' ? 'rgba(26,115,232,0.04)' : 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Τα θέματα έχουν παρθεί από το{' '}
            <a href="https://dsuth-exambank.gitlab.io/" target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.mode === 'light' ? '#1a73e8' : '#8ab4f8', fontWeight: 600, textDecoration: 'none' }}>
              dsuth exam bank
            </a>{' '}
            και το{' '}
            <a href="https://drive.google.com/drive/folders/0B5ICraEWxrM1NjBuWG9kZlJuWGc?resourcekey=0-zoL2-dVJmJioaH3UZkqMYg" target="_blank" rel="noopener noreferrer" style={{ color: theme.palette.mode === 'light' ? '#1a73e8' : '#8ab4f8', fontWeight: 600, textDecoration: 'none' }}>
              drive
            </a>.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home;