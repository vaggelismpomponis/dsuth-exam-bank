import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Button, Paper, Stack, Skeleton, IconButton, Chip
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { supabase } from '../supabaseClient';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HelpIcon from '@mui/icons-material/Help';
import PersonIcon from '@mui/icons-material/Person';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTheme } from '@mui/material/styles';

/* Animated counter hook */
const useCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const StatCard = ({ value, label, suffix = '', icon, delay }) => {
  const count = useCounter(value);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <Box
      className={`animate-fade-up stagger-${delay}`}
      sx={{
        flex: 1,
        textAlign: 'center',
        py: 3,
        px: 2,
        borderRadius: '16px',
        bgcolor: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <Box sx={{ mb: 1 }}>{icon}</Box>
      <Typography sx={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-0.03em' }}>
        {count}{suffix}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.75)', mt: 0.5, fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
};

const Home = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

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

  const features = [
    {
      icon: <MenuBookIcon />,
      title: 'Μαθήματα',
      desc: 'Εξερευνήστε όλα τα μαθήματα οργανωμένα ανά εξάμηνο',
      href: '/courses',
      gradient: 'linear-gradient(135deg, #1a73e8, #0052cc)',
      lightBg: '#e8f0fe',
      lightColor: '#1a73e8',
    },
    {
      icon: <UploadFileIcon />,
      title: 'Ανέβασμα',
      desc: 'Προσθέστε θέματα εξετάσεων για να βοηθήσετε την κοινότητα',
      href: '/upload',
      gradient: 'linear-gradient(135deg, #1e8e3e, #0d7234)',
      lightBg: '#e6f4ea',
      lightColor: '#1e8e3e',
    },
    {
      icon: <HelpIcon />,
      title: 'Αιτήματα',
      desc: 'Ζητήστε αρχεία που δεν βρίσκονται ακόμα στην πλατφόρμα',
      href: '/requests',
      gradient: 'linear-gradient(135deg, #ea8600, #c46800)',
      lightBg: '#fef3e2',
      lightColor: '#ea8600',
    },
    {
      icon: <FavoriteIcon />,
      title: 'Αγαπημένα',
      desc: 'Αποθηκεύστε μαθήματα για γρήγορη πρόσβαση',
      href: '/favorites',
      gradient: 'linear-gradient(135deg, #d93025, #b0231a)',
      lightBg: '#fde7e7',
      lightColor: '#d93025',
    },
    {
      icon: <GroupIcon />,
      title: 'Φοιτητές',
      desc: 'Δείτε τους συμφοιτητές σας στο τμήμα',
      href: '/students',
      gradient: 'linear-gradient(135deg, #7b1fa2, #5c1383)',
      lightBg: '#f3e5f5',
      lightColor: '#7b1fa2',
    },
    {
      icon: <QuestionAnswerIcon />,
      title: 'Επικοινωνία',
      desc: 'Στείλτε μας τις απορίες και προτάσεις σας',
      href: '/contact',
      gradient: 'linear-gradient(135deg, #00796b, #004d40)',
      lightBg: '#e0f2f1',
      lightColor: '#00796b',
    },
  ];

  return (
    <Box
      sx={{
        width: '100vw',
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflowX: 'hidden',
        pb: { xs: 10, md: 0 },
      }}
    >
      {/* ── HERO SECTION ── */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(135deg, #0d1528 0%, #1a2744 40%, #101c3d 80%, #0d1528 100%)'
            : 'linear-gradient(135deg, #1a73e8 0%, #0052cc 40%, #1565c0 70%, #1a73e8 100%)',
          backgroundSize: '200% 200%',
          animation: 'gradientShift 8s ease infinite',
          pt: { xs: 5, md: 8 },
          pb: { xs: 6, md: 10 },
          px: { xs: 2.5, md: 4 },
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{
          position: 'absolute', top: -80, right: -80, width: 320, height: 320,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -120, left: -60, width: 400, height: 400,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', top: '30%', right: '15%', width: 80, height: 80,
          borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)',
          pointerEvents: 'none',
        }} />

        <Box sx={{ maxWidth: 860, mx: 'auto', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <Box
            className="animate-fade-up"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.8,
              bgcolor: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '100px',
              px: 2,
              py: 0.6,
              mb: 3,
            }}
          >
            <StarIcon sx={{ fontSize: 13, color: '#ffd700' }} />
            <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.9)', fontWeight: 600, letterSpacing: '0.02em' }}>
              Ψηφιακά Συστήματα UTH
            </Typography>
          </Box>

          {/* Headline */}
          <Typography
            variant="h1"
            className="animate-fade-up stagger-1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.4rem' },
              color: '#fff',
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
              mb: 2,
            }}
          >
            Τράπεζα Θεμάτων{' '}
            <Box
              component="span"
              sx={{
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                px: 1,
                py: 0.2,
                backdropFilter: 'blur(4px)',
              }}
            >
              DSUth
            </Box>
          </Typography>

          <Typography
            className="animate-fade-up stagger-2"
            sx={{
              fontSize: { xs: '1rem', md: '1.1rem' },
              color: 'rgba(255,255,255,0.8)',
              mb: 4,
              maxWidth: 520,
              lineHeight: 1.65,
            }}
          >
            Παλιά θέματα εξετάσεων, σημειώσεις και υλικό μελέτης — μοιράσου γνώση,
            βοήθησε τους συμφοιτητές σου.
          </Typography>

          {/* CTA Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            className="animate-fade-up stagger-3"
            sx={{ mb: 6 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/courses')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#fff',
                color: '#1a73e8',
                fontWeight: 700,
                fontSize: '0.95rem',
                px: 3,
                py: 1.4,
                borderRadius: '14px',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.92)' },
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              }}
            >
              Εξερεύνησε Μαθήματα
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/upload')}
              startIcon={<UploadFileIcon />}
              sx={{
                borderColor: 'rgba(255,255,255,0.4)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.95rem',
                px: 3,
                py: 1.4,
                borderRadius: '14px',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.6)' },
              }}
            >
              Ανέβασε Αρχείο
            </Button>
          </Stack>

          {/* Stats */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} className="animate-fade-up stagger-4">
            <StatCard value={150} suffix="+" label="Θέματα Εξετάσεων" icon={<DescriptionIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 22 }} />} delay={4} />
            <StatCard value={25} label="Συνεισφέροντες" icon={<GroupIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 22 }} />} delay={5} />
            <StatCard value={8} label="Εξάμηνα" icon={<SchoolIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 22 }} />} delay={6} />
          </Stack>
        </Box>
      </Box>

      {/* ── RECENT FILES ── */}
      <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 2.5, md: 4 }, pt: { xs: 5, md: 7 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.15rem', letterSpacing: '-0.01em' }}>
              Πρόσφατα Αρχεία
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              Τελευταία ανεβασμένα θέματα
            </Typography>
          </Box>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
            onClick={() => navigate('/courses')}
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.8rem',
              borderRadius: '10px',
              px: 1.5,
              py: 0.7,
              '&:hover': { bgcolor: isDark ? 'rgba(26,115,232,0.1)' : 'rgba(26,115,232,0.06)' },
            }}
          >
            Όλα
          </Button>
        </Box>

        {loading ? (
          <Stack spacing={1.5}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rounded" height={72} sx={{ borderRadius: '14px' }} />
            ))}
          </Stack>
        ) : exams.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              px: 3,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: '16px',
            }}
          >
            <DescriptionIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary" variant="body2">Δεν βρέθηκαν αρχεία</Typography>
          </Box>
        ) : (
          <Stack spacing={1}>
            {exams.map((exam, index) => (
              <Paper
                key={exam.id}
                className={`animate-fade-up stagger-${Math.min(index + 1, 6)}`}
                sx={{
                  p: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  borderRadius: '14px',
                  cursor: 'default',
                  transition: 'all 0.2s ease',
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
                  '&:hover': {
                    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.07)',
                    transform: 'translateY(-2px)',
                    borderColor: isDark ? 'rgba(26,115,232,0.3)' : 'rgba(26,115,232,0.2)',
                  },
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                  <Box
                    sx={{
                      minWidth: 42,
                      height: 42,
                      borderRadius: '12px',
                      background: isDark ? 'rgba(26,115,232,0.15)' : 'rgba(26,115,232,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <DescriptionIcon sx={{ fontSize: 20, color: isDark ? '#8ab4f8' : '#1a73e8' }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.9rem' }}>
                      {exam.course || 'Άγνωστο Μάθημα'}
                    </Typography>
                    <Stack direction="row" spacing={0.8} alignItems="center" sx={{ mt: 0.3 }}>
                      <Chip
                        label={exam.year}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                          color: 'text.secondary',
                          '& .MuiChip-label': { px: 1 },
                        }}
                      />
                      {exam.period && (
                        <Chip
                          label={exam.period}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            bgcolor: isDark ? 'rgba(26,115,232,0.12)' : 'rgba(26,115,232,0.07)',
                            color: isDark ? '#8ab4f8' : '#1a73e8',
                            '& .MuiChip-label': { px: 1 },
                          }}
                        />
                      )}
                    </Stack>
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
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    color: 'primary.main',
                    bgcolor: isDark ? 'rgba(26,115,232,0.12)' : 'rgba(26,115,232,0.07)',
                    flexShrink: 0,
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.14)',
                    },
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      {/* ── FEATURES GRID ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 }, px: { xs: 2.5, md: 5 } }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Chip
            label="Δυνατότητες"
            size="small"
            sx={{
              mb: 2,
              bgcolor: isDark ? 'rgba(26,115,232,0.12)' : 'rgba(26,115,232,0.08)',
              color: isDark ? '#8ab4f8' : '#1a73e8',
              fontWeight: 700,
              fontSize: '0.75rem',
              border: '1px solid',
              borderColor: isDark ? 'rgba(26,115,232,0.25)' : 'rgba(26,115,232,0.2)',
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              mb: 1.5,
              fontSize: { xs: '1.6rem', md: '2rem' },
            }}
          >
            Όλα σε ένα μέρος
          </Typography>
          <Typography sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto', fontSize: '0.95rem', lineHeight: 1.65 }}>
            Ανακαλύψτε τις δυνατότητες της πλατφόρμας και ξεκινήστε να συνεισφέρετε στην κοινότητα
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          {features.map((f, i) => (
            <Paper
              key={f.title}
              onClick={() => navigate(f.href)}
              className={`animate-fade-up stagger-${Math.min(i + 1, 6)}`}
              sx={{
                p: 2.5,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                borderRadius: '16px',
                bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.3)' : '0 12px 40px rgba(0,0,0,0.09)',
                  borderColor: isDark ? 'rgba(26,115,232,0.3)' : 'rgba(26,115,232,0.2)',
                  '& .feature-icon': {
                    background: f.gradient,
                    '& svg': { color: '#fff !important' },
                  },
                },
              }}
            >
              <Box
                className="feature-icon"
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: '14px',
                  bgcolor: f.lightBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  transition: 'all 0.2s ease',
                  '& svg': { fontSize: 22, color: f.lightColor, transition: 'color 0.2s ease' },
                }}
              >
                {f.icon}
              </Box>
              <Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5, fontSize: '0.95rem' }}>
                {f.title}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.83rem', lineHeight: 1.55 }}>
                {f.desc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>

      {/* ── CTA BAND ── */}
      <Box
        sx={{
          mx: { xs: 2.5, md: 5 },
          mb: { xs: 4, md: 8 },
          borderRadius: '20px',
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(135deg, #1a2744, #0d1528)'
            : 'linear-gradient(135deg, #1a73e8, #0052cc)',
          p: { xs: 4, md: 6 },
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -30, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#fff', mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '1.4rem', md: '1.7rem' } }}>
            Έχεις παλιά θέματα εξετάσεων;
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.78)', mb: 3.5, maxWidth: 460, mx: 'auto', fontSize: '0.95rem', lineHeight: 1.65 }}>
            Βοήθησε την κοινότητα στέλνοντας τα δικά σου αρχεία. Η γνώση ανήκει σε όλους.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<UploadFileIcon />}
              href="/upload"
              sx={{
                bgcolor: '#fff',
                color: '#1a73e8',
                fontWeight: 700,
                px: 3,
                py: 1.4,
                borderRadius: '14px',
                fontSize: '0.95rem',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              Ανέβασε Αρχείο
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="/contact"
              sx={{
                borderColor: 'rgba(255,255,255,0.35)',
                color: '#fff',
                fontWeight: 600,
                px: 3,
                py: 1.4,
                borderRadius: '14px',
                fontSize: '0.95rem',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.6)' },
              }}
            >
              Επικοινωνία
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* ── ADMIN APPLICATION BANNER ── */}
      <Box sx={{ maxWidth: 860, mx: 'auto', px: { xs: 2.5, md: 4 }, pb: { xs: 4, md: 8 } }}>
        <Paper
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: '16px',
            bgcolor: isDark ? 'rgba(26,115,232,0.06)' : 'rgba(26,115,232,0.04)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.15)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '14px',
                flexShrink: 0,
                background: isDark ? 'rgba(26,115,232,0.15)' : 'rgba(26,115,232,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AdminPanelSettingsIcon sx={{ color: isDark ? '#8ab4f8' : '#1a73e8', fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem', mb: 0.25 }}>
                Γίνε Διαχειριστής
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', lineHeight: 1.5 }}>
                Θέλεις να βοηθήσεις στη διαχείριση; Συμπλήρωσε τη φόρμα για να λάβεις δικαιώματα Admin.
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate('/admin-application')}
            sx={{
              flexShrink: 0,
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              px: 2.5,
              py: 0.9,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Αίτηση Admin
          </Button>
        </Paper>

        {/* Sources */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.disabled', fontSize: '0.8rem', lineHeight: 1.7 }}>
            Τα θέματα έχουν παρθεί από το{' '}
            <Box
              component="a"
              href="https://dsuth-exambank.gitlab.io/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              dsuth exam bank
            </Box>
            {' '}και το{' '}
            <Box
              component="a"
              href="https://drive.google.com/drive/folders/0B5ICraEWxrM1NjBuWG9kZlJuWGc?resourcekey=0-zoL2-dVJmJioaH3UZkqMYg"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Google Drive
            </Box>.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;