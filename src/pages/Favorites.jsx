import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Skeleton, Stack,
  IconButton, TextField, InputAdornment, Button, Paper, useTheme
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

/* ── Semester accent palette (mirrors Courses.jsx) ── */
const SEMESTER_PALETTE = [
  { color: '#1a73e8' },
  { color: '#0f9d58' },
  { color: '#e37400' },
  { color: '#d93025' },
  { color: '#7b1fa2' },
  { color: '#00897b' },
  { color: '#c62828' },
  { color: '#1565c0' },
];

const Favorites = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examCounts, setExamCounts] = useState({});
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  /* ── Auth ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) =>
      setUser(data?.session?.user || null)
    );
  }, []);

  /* ── Fetch favorites ── */
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    supabase.from('favorites').select('course_id').eq('user_id', user.id)
      .then(async ({ data, error }) => {
        if (!error && data) {
          const favIds = data.map(f => f.course_id);
          setFavorites(favIds);
          if (favIds.length > 0) {
            const { data: courseData } = await supabase
              .from('courses').select('*').in('id', favIds);
            setCourses(courseData || []);
          } else {
            setCourses([]);
          }
        }
        setLoading(false);
      });
  }, [user]);

  /* ── Exam counts ── */
  useEffect(() => {
    supabase.from('exams')
      .select('course, id', { count: 'exact', head: false })
      .eq('approved', true)
      .then(({ data, error }) => {
        if (!error && data) {
          const counts = {};
          data.forEach(e => { counts[e.course] = (counts[e.course] || 0) + 1; });
          setExamCounts(counts);
        }
      });
  }, []);

  /* ── Toggle favorite ── */
  const toggleFavorite = async (courseId) => {
    if (!user) return;
    setFavLoading(true);
    if (favorites.includes(courseId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('course_id', courseId);
      setFavorites(prev => prev.filter(id => id !== courseId));
      setCourses(prev => prev.filter(c => c.id !== courseId));
    } else {
      await supabase.from('favorites').insert([{ user_id: user.id, course_id: courseId }]);
      setFavorites(prev => [...prev, courseId]);
    }
    setFavLoading(false);
  };

  /* ── Derived ── */
  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filteredCourses.reduce((acc, course) => {
    acc[course.semester] = acc[course.semester] || [];
    acc[course.semester].push(course);
    return acc;
  }, {});

  const heroGradient = isDark
    ? 'linear-gradient(135deg, #1e2a3a 0%, #1e2230 100%)'
    : 'linear-gradient(135deg, #fce4ec 0%, #f8efff 50%, #e8f0fe 100%)';

  /* ── Not logged in ── */
  if (!loading && !user) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
        <Paper sx={{
          width: '100%', maxWidth: 400, p: 4, textAlign: 'center',
          border: '1px solid', borderColor: 'divider', borderRadius: '20px',
        }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '18px', mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, #d93025, #e57373)',
            boxShadow: '0 8px 24px rgba(217,48,37,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FavoriteRoundedIcon sx={{ color: '#fff', fontSize: 30 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75 }}>Αγαπημένα</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mb: 3 }}>
            Συνδέσου για να δεις τα αγαπημένα σου μαθήματα.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate('/login')}
            sx={{ py: 1.3, borderRadius: '12px', fontWeight: 700 }}
          >
            Σύνδεση
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>

      {/* ── Hero Header ── */}
      <Box sx={{
        background: heroGradient,
        borderBottom: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(217,48,37,0.1)',
        pt: { xs: 5, md: 7 },
        pb: { xs: 4, md: 6 },
        px: 2,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <Box sx={{
          position: 'absolute', top: -60, right: -60, width: 220, height: 220,
          borderRadius: '50%',
          background: isDark ? 'rgba(217,48,37,0.06)' : 'rgba(217,48,37,0.1)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -40, left: '30%', width: 160, height: 160,
          borderRadius: '50%',
          background: isDark ? 'rgba(123,31,162,0.06)' : 'rgba(123,31,162,0.06)',
          pointerEvents: 'none',
        }} />

        <Container maxWidth="md" sx={{ position: 'relative' }}>
          {/* Icon badge */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: '16px',
            background: 'linear-gradient(135deg, #d93025, #b71c1c)',
            boxShadow: '0 8px 24px rgba(217,48,37,0.35)',
            mb: 2.5,
          }}>
            <FavoriteRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>

          <Typography variant="h3" sx={{
            fontWeight: 900, letterSpacing: '-0.03em',
            color: 'text.primary',
            fontSize: { xs: '2rem', md: '2.6rem' },
            mb: 1, lineHeight: 1.15,
          }}>
            Αγαπημένα
          </Typography>
          <Typography sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            maxWidth: 440, mb: 3.5,
          }}>
            Τα μαθήματα που έχεις αποθηκεύσει για γρήγορη πρόσβαση
          </Typography>

          {/* Stats pills */}
          {!loading && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.8,
                px: 1.8, py: 0.7, borderRadius: '100px',
                bgcolor: isDark ? 'rgba(217,48,37,0.15)' : 'rgba(217,48,37,0.09)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(217,48,37,0.3)' : 'rgba(217,48,37,0.2)',
              }}>
                <FavoriteRoundedIcon sx={{ fontSize: 14, color: '#d93025' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#d93025' }}>
                  {courses.length} {courses.length === 1 ? 'μάθημα' : 'μαθήματα'}
                </Typography>
              </Box>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.8,
                px: 1.8, py: 0.7, borderRadius: '100px',
                bgcolor: isDark ? 'rgba(15,157,88,0.12)' : 'rgba(15,157,88,0.08)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(15,157,88,0.25)' : 'rgba(15,157,88,0.18)',
              }}>
                <InsertDriveFileRoundedIcon sx={{ fontSize: 14, color: '#0f9d58' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f9d58' }}>
                  {courses.reduce((sum, c) => sum + (examCounts[c.name] || 0), 0)} αρχεία
                </Typography>
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      {/* ── Body ── */}
      <Container maxWidth="md" sx={{ pt: 4, pb: { xs: 12, md: 8 } }}>

        {/* Search bar — sticky */}
        <Box sx={{
          mb: 4,
          position: 'sticky',
          top: { xs: 56, md: 64 },
          zIndex: 10,
          pt: 1.5, pb: 0.5,
          mx: { xs: -2, md: 0 },
          px: { xs: 2, md: 0 },
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          bgcolor: isDark ? 'rgba(22,23,26,0.85)' : 'rgba(248,250,251,0.88)',
        }}>
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Αναζήτηση στα αγαπημένα..."
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                boxShadow: isDark ? 'none' : '0 1px 6px rgba(0,0,0,0.06)',
              },
            }}
          />
        </Box>

        {/* ── Content ── */}
        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: '16px' }} />
            ))}
          </Stack>
        ) : courses.length === 0 ? (
          /* No favorites at all */
          <Box sx={{
            textAlign: 'center', py: 12, px: 3,
            border: '2px dashed', borderColor: 'divider', borderRadius: '24px',
          }}>
            <FavoriteIcon sx={{ fontSize: 56, color: 'text.disabled', opacity: 0.3, mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
              Δεν έχεις αγαπημένα ακόμα
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              Πρόσθεσε μαθήματα στα αγαπημένα από τη σελίδα μαθημάτων
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/courses"
              sx={{ borderRadius: '12px', fontWeight: 700 }}
            >
              Εξερεύνηση Μαθημάτων
            </Button>
          </Box>
        ) : Object.keys(grouped).length === 0 ? (
          /* No search results */
          <Box sx={{
            textAlign: 'center', py: 10, px: 3,
            border: '2px dashed', borderColor: 'divider', borderRadius: '24px',
          }}>
            <SearchIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
              Δεν βρέθηκαν αποτελέσματα
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Δοκιμάστε διαφορετικούς όρους αναζήτησης
            </Typography>
          </Box>
        ) : (
          Object.keys(grouped).sort((a, b) => a - b).map((sem, semIdx) => {
            const palette = SEMESTER_PALETTE[(Number(sem) - 1) % SEMESTER_PALETTE.length];
            return (
              <Box
                key={sem}
                sx={{
                  mb: 5,
                  animation: 'fadeInUp 0.45s ease both',
                  animationDelay: `${semIdx * 0.05}s`,
                }}
              >
                {/* Semester label row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.6, py: 0.55, borderRadius: '100px',
                    bgcolor: `${palette.color}15`,
                    border: '1.5px solid', borderColor: `${palette.color}35`,
                  }}>
                    <Box sx={{
                      width: 7, height: 7, borderRadius: '50%',
                      bgcolor: palette.color,
                      boxShadow: `0 0 6px ${palette.color}80`,
                    }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '0.78rem', color: palette.color, letterSpacing: '0.01em' }}>
                      {sem}ο Εξάμηνο
                    </Typography>
                  </Box>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: 'text.disabled', fontWeight: 600 }}>
                    {grouped[sem].length} {grouped[sem].length === 1 ? 'μάθημα' : 'μαθήματα'}
                  </Typography>
                </Box>

                {/* Course cards — 2-column grid */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}>
                  {grouped[sem].map((course, idx) => (
                    <FavCourseCard
                      key={course.id}
                      course={course}
                      count={examCounts[course.name] || 0}
                      color={palette.color}
                      isDark={isDark}
                      idx={idx + semIdx * 10}
                      user={user}
                      favLoading={favLoading}
                      onToggleFav={toggleFavorite}
                    />
                  ))}
                </Box>
              </Box>
            );
          })
        )}
      </Container>
    </Box>
  );
};

/* ── FavCourseCard sub-component ── */
function FavCourseCard({ course, count, color, isDark, idx, user, favLoading, onToggleFav }) {
  return (
    <Link to={`/courses/${course.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <Box sx={{
        p: '14px 16px',
        borderRadius: '16px',
        bgcolor: isDark ? 'rgba(255,255,255,0.028)' : '#fff',
        border: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        transition: 'all 0.22s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        animation: 'fadeInUp 0.4s ease both',
        animationDelay: `${0.05 + idx * 0.03}s`,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0, top: '20%', bottom: '20%',
          width: '3px', borderRadius: '0 3px 3px 0',
          bgcolor: color,
          opacity: 0,
          transition: 'opacity 0.22s ease',
        },
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark
            ? `0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px ${color}25`
            : `0 8px 32px rgba(0,0,0,0.09), 0 0 0 1px ${color}20`,
          borderColor: isDark ? `${color}40` : `${color}30`,
          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : `${color}04`,
          '&::before': { opacity: 1 },
        },
      }}>
        {/* Icon */}
        <Box sx={{
          width: 40, height: 40, borderRadius: '12px',
          bgcolor: `${color}14`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid', borderColor: `${color}20`,
          transition: 'all 0.22s ease',
        }}>
          <SchoolRoundedIcon sx={{ color, fontSize: 19 }} />
        </Box>

        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            fontWeight: 700, color: 'text.primary',
            fontSize: '0.85rem', lineHeight: 1.35, mb: 0.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {course.name}
          </Typography>

          {/* File count badge */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.5,
            px: 0.9, py: 0.25, borderRadius: '8px',
            bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
          }}>
            <InsertDriveFileRoundedIcon sx={{ fontSize: 10, color: 'text.disabled' }} />
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: count > 0 ? color : 'text.disabled' }}>
              {count} {count === 1 ? 'αρχείο' : 'αρχεία'}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0 }}>
          {user && (
            <IconButton
              onClick={e => { e.preventDefault(); e.stopPropagation(); onToggleFav(course.id); }}
              size="small"
              disabled={favLoading}
              sx={{
                width: 30, height: 30,
                color: '#d93025',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: 'rgba(217,48,37,0.09)',
                  transform: 'scale(1.15)',
                },
              }}
            >
              <FavoriteIcon sx={{ fontSize: 15 }} />
            </IconButton>
          )}
          <Box sx={{
            color: 'text.disabled',
            display: 'flex', alignItems: 'center',
            ml: 0.25,
            transition: 'transform 0.18s ease',
            '.MuiBox-root:hover > &': { transform: 'translateX(2px)' },
          }}>
            <ArrowForwardIosRoundedIcon sx={{ fontSize: 11 }} />
          </Box>
        </Box>
      </Box>
    </Link>
  );
}

export default Favorites;