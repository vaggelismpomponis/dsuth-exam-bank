import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent,
  Avatar, TextField, InputAdornment, Skeleton,
  Snackbar, Alert, Chip, useTheme, alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PersonSearchOutlinedIcon from '@mui/icons-material/PersonSearchOutlined';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

/* ── avatar palette – cycles through vibrant hues ── */
const AVATAR_COLORS = [
  { bg: '#e8f0fe', color: '#1a73e8' },
  { bg: '#fce8e6', color: '#d93025' },
  { bg: '#e6f4ea', color: '#1e8e3e' },
  { bg: '#fef7e0', color: '#f9ab00' },
  { bg: '#f3e8fd', color: '#9334e6' },
  { bg: '#e8f5e9', color: '#00897b' },
  { bg: '#fbe9e7', color: '#e64a19' },
  { bg: '#e3f2fd', color: '#0277bd' },
];

const AVATAR_COLORS_DARK = [
  { bg: 'rgba(26,115,232,0.18)', color: '#7baaf7' },
  { bg: 'rgba(217,48,37,0.18)', color: '#f28b82' },
  { bg: 'rgba(30,142,62,0.18)', color: '#81c995' },
  { bg: 'rgba(249,171,0,0.18)', color: '#fdd663' },
  { bg: 'rgba(147,52,230,0.18)', color: '#c58af9' },
  { bg: 'rgba(0,137,123,0.18)', color: '#4db6ac' },
  { bg: 'rgba(230,74,25,0.18)', color: '#ff8a65' },
  { bg: 'rgba(2,119,189,0.18)', color: '#4fc3f7' },
];

const getAvatarColor = (index, dark) => {
  const palette = dark ? AVATAR_COLORS_DARK : AVATAR_COLORS;
  return palette[index % palette.length];
};

/* ── skeleton card ── */
const SkeletonCard = () => (
  <Card sx={{ p: 0, overflow: 'hidden' }}>
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="circular" width={52} height={52} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="65%" height={20} sx={{ mb: 0.75 }} />
          <Skeleton width="40%" height={16} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

/* ── student card ── */
const StudentCard = ({ student, index, dark }) => {
  const { bg, color } = getAvatarColor(index, dark);
  const initials = [student.first_name?.[0], student.last_name?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?';
  const fullName = [student.first_name, student.last_name].filter(Boolean).join(' ') || 'Άγνωστος Φοιτητής';

  return (
    <Card
      sx={{
        animationDelay: `${index * 40}ms`,
        animation: 'fadeSlideUp 0.4s ease both',
        '@keyframes fadeSlideUp': {
          from: { opacity: 0, transform: 'translateY(14px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: dark
            ? '0 12px 32px rgba(0,0,0,0.5)'
            : '0 12px 32px rgba(26,115,232,0.12)',
        },
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 52, height: 52,
              bgcolor: bg,
              color,
              fontWeight: 800,
              fontSize: '1.05rem',
              flexShrink: 0,
              border: `2px solid ${color}22`,
            }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '0.95rem',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fullName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.4 }}>
              <SchoolOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                Φοιτητής/τρια
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

/* ── main component ── */
const StudentsDirectory = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const theme = useTheme();
  const dark = theme.palette.mode === 'dark';
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        navigate('/login');
        return;
      }
      fetchStudents();
    });

    const fetchStudents = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .eq('role', 'student')
        .order('last_name', { ascending: true });

      if (!ignore) {
        if (!error && data) setStudents(data);
        setLoading(false);
      }
    };

    return () => { ignore = true; };
  }, [navigate]);

  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <Box sx={{ minHeight: '100vh', pb: { xs: 12, md: 6 } }}>

      {/* ── Hero Banner ── */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background: dark
            ? 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #1a1f2c 100%)'
            : 'linear-gradient(135deg, #1a73e8 0%, #1557b0 50%, #0d47a1 100%)',
          pt: { xs: 5, md: 7 },
          pb: { xs: 7, md: 9 },
          px: 2,
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{
          position: 'absolute', top: -60, right: -60, width: 240, height: 240,
          borderRadius: '50%',
          background: dark ? 'rgba(26,115,232,0.12)' : 'rgba(255,255,255,0.08)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -40, left: -40, width: 180, height: 180,
          borderRadius: '50%',
          background: dark ? 'rgba(147,52,230,0.1)' : 'rgba(255,255,255,0.06)',
          pointerEvents: 'none',
        }} />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <Box sx={{
              width: 48, height: 48, borderRadius: '14px',
              background: dark ? 'rgba(26,115,232,0.25)' : 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}>
              <PeopleAltOutlinedIcon sx={{ color: '#fff', fontSize: 26 }} />
            </Box>
            <Typography variant="h4" sx={{
              fontWeight: 800,
              color: '#fff',
              letterSpacing: '-0.02em',
            }}>
              Κατάλογος Φοιτητών
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Typography sx={{
              color: dark ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.82)',
              fontSize: '1rem',
              maxWidth: 480,
            }}>
              Βρείτε και γνωρίστε συναδέλφους φοιτητές του τμήματος.
            </Typography>
            {!loading && (
              <Chip
                icon={<PeopleAltOutlinedIcon sx={{ fontSize: '14px !important', color: 'rgba(255,255,255,0.85) !important' }} />}
                label={`${students.length} φοιτητές`}
                size="small"
                sx={{
                  flexShrink: 0,
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.18)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(8px)',
                  '& .MuiChip-icon': { color: 'rgba(255,255,255,0.85)' },
                }}
              />
            )}
          </Box>

          {/* Glassmorphism search bar */}
          <Box sx={{
            background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)'}`,
            borderRadius: '16px',
            p: '6px 6px 6px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            transition: 'background 0.2s, box-shadow 0.2s',
            '&:focus-within': {
              background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.22)',
              boxShadow: '0 0 0 3px rgba(255,255,255,0.15)',
            },
          }}>
            <SearchIcon sx={{ color: dark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.75)', fontSize: 22 }} />
            <TextField
              fullWidth
              variant="standard"
              placeholder="Αναζήτηση με όνομα..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ disableUnderline: true }}
              sx={{
                '& input': {
                  color: '#fff',
                  fontWeight: 500,
                  fontSize: '0.97rem',
                  py: 0.75,
                  '&::placeholder': {
                    color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.65)',
                    opacity: 1,
                  },
                },
              }}
            />
          </Box>
        </Container>
      </Box>

      {/* ── Content ── */}
      <Container maxWidth="md" sx={{ mt: 3, position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>

        {/* Filter result indicator */}
        {!loading && searchQuery && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Chip
              icon={<PeopleAltOutlinedIcon sx={{ fontSize: '15px !important' }} />}
              label={`${filteredStudents.length} από ${students.length} φοιτητές`}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                borderRadius: '8px',
                background: dark ? alpha('#1a73e8', 0.15) : alpha('#1a73e8', 0.1),
                color: 'primary.main',
                border: `1px solid ${alpha('#1a73e8', 0.2)}`,
                '& .MuiChip-icon': { color: 'primary.main' },
              }}
            />
            {searchQuery && (
              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                Αποτελέσματα για «{searchQuery}»
              </Typography>
            )}
          </Box>
        )}

        {/* Grid */}
        {loading ? (
          <Grid container spacing={2}>
            {[...Array(9)].map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <SkeletonCard />
              </Grid>
            ))}
          </Grid>
        ) : filteredStudents.length === 0 ? (
          <Box sx={{
            textAlign: 'center', py: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '18px',
              background: dark ? alpha('#1a73e8', 0.12) : alpha('#1a73e8', 0.08),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <PersonSearchOutlinedIcon sx={{ fontSize: 36, color: 'primary.main', opacity: 0.7 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Δεν βρέθηκαν αποτελέσματα</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
              Δοκιμάστε διαφορετικό όνομα.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {filteredStudents.map((student, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={student.id}>
                <StudentCard student={student} index={index} dark={dark} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(p => ({ ...p, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentsDirectory;
