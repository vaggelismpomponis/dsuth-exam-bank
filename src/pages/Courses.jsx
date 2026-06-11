import React, { useEffect, useState, useRef } from 'react';
import {
  Container, Typography, Box, Skeleton, Stack,
  useTheme, IconButton, Chip, TextField, InputAdornment, Tooltip
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { cachedQuery } from '../lib/queryCache';
import { withStaticFallback } from '../lib/staticData';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

/* ── Semester accent palette ── */
const SEMESTER_PALETTE = [
  { color: '#1a73e8', label: '1ο' },
  { color: '#0f9d58', label: '2ο' },
  { color: '#e37400', label: '3ο' },
  { color: '#d93025', label: '4ο' },
  { color: '#7b1fa2', label: '5ο' },
  { color: '#00897b', label: '6ο' },
  { color: '#c62828', label: '7ο' },
  { color: '#1565c0', label: '8ο' },
];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examCounts, setExamCounts] = useState({});
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeSem, setActiveSem] = useState(null); // null = all
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const tabsRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);

      // Both queries run in parallel and are cached independently.
      // Courses: 10-minute TTL (course list almost never changes).
      // Exam counts: 5-minute TTL (new uploads approved a few times a day at most).
      const [coursesData, examsRaw] = await Promise.all([
        cachedQuery(
          'courses:list',
          () => withStaticFallback(
            '/data/courses.json',
            async () => {
              const { data } = await supabase
                .from('courses')
                .select('*')
                .order('semester, name', { ascending: true });
              return data ?? [];
            }
          ),
          10 * 60 * 1000
        ),
        cachedQuery(
          'exams:counts',
          () => withStaticFallback(
            '/data/exams-counts.json',
            async () => {
              const { data } = await supabase
                .from('exams')
                .select('course, id')
                .eq('approved', true);
              return data ?? [];
            }
          ),
          5 * 60 * 1000
        ),
      ]);

      setCourses(coursesData);

      // exams-counts.json is already a { courseName: count } map from the prebuild script.
      // The live Supabase fallback returns an array of { course, id } rows — re-aggregate those.
      let counts;
      if (Array.isArray(examsRaw)) {
        counts = {};
        examsRaw.forEach(e => { counts[e.course] = (counts[e.course] || 0) + 1; });
      } else {
        counts = examsRaw; // already a map from static JSON
      }
      setExamCounts(counts);

      setLoading(false);
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (!user) return;
    setFavLoading(true);
    supabase
      .from('favorites')
      .select('course_id')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) setFavorites(data.map(f => f.course_id));
        setFavLoading(false);
      });
  }, [user]);

  const toggleFavorite = async (courseId) => {
    if (!user) return;
    setFavLoading(true);
    if (favorites.includes(courseId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('course_id', courseId);
      setFavorites(favorites.filter(id => id !== courseId));
    } else {
      await supabase.from('favorites').insert([{ user_id: user.id, course_id: courseId }]);
      setFavorites([...favorites, courseId]);
    }
    setFavLoading(false);
  };

  /* ── Derived data ── */
  const allSemesters = [...new Set(courses.map(c => c.semester))].sort((a, b) => a - b);

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(search.toLowerCase());
    const matchesSem = activeSem === null ? true : course.semester === activeSem;
    return matchesSearch && matchesSem;
  });

  const grouped = filteredCourses.reduce((acc, course) => {
    acc[course.semester] = acc[course.semester] || [];
    acc[course.semester].push(course);
    return acc;
  }, {});

  const totalFiles = Object.values(examCounts).reduce((a, b) => a + b, 0);

  /* ── Styles ── */
  const heroGradient = isDark
    ? 'linear-gradient(135deg, #1e2a3a 0%, #1e2230 100%)'
    : 'linear-gradient(135deg, #e8f0fe 0%, #f0f4ff 60%, #fce4ec 100%)';

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* ── Hero Header ── */}
      <Box
        sx={{
          background: heroGradient,
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(26,115,232,0.12)',
          pt: { xs: 5, md: 7 },
          pb: { xs: 4, md: 6 },
          px: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{
          position: 'absolute', top: -60, right: -60, width: 220, height: 220,
          borderRadius: '50%',
          background: isDark ? 'rgba(26,115,232,0.08)' : 'rgba(26,115,232,0.12)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -40, left: '30%', width: 160, height: 160,
          borderRadius: '50%',
          background: isDark ? 'rgba(123,31,162,0.07)' : 'rgba(123,31,162,0.07)',
          pointerEvents: 'none',
        }} />

        <Container maxWidth="md" sx={{ position: 'relative' }}>
          {/* Icon badge */}
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1a73e8, #1557b0)',
            boxShadow: '0 8px 24px rgba(26,115,232,0.35)',
            mb: 2.5,
          }}>
            <MenuBookRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: 'text.primary',
              fontSize: { xs: '2rem', md: '2.6rem' },
              mb: 1,
              lineHeight: 1.15,
            }}
          >
            Μαθήματα
          </Typography>
          <Typography sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            maxWidth: 440,
            mb: 3.5,
          }}>
            Βρες αρχεία εξετάσεων ανά μάθημα και εξάμηνο
          </Typography>

          {/* Stats pills */}
          {!loading && (
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.8,
                px: 1.8, py: 0.7,
                borderRadius: '100px',
                bgcolor: isDark ? 'rgba(26,115,232,0.15)' : 'rgba(26,115,232,0.1)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(26,115,232,0.3)' : 'rgba(26,115,232,0.2)',
              }}>
                <SchoolRoundedIcon sx={{ fontSize: 15, color: '#1a73e8' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#1a73e8' }}>
                  {courses.length} μαθήματα
                </Typography>
              </Box>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.8,
                px: 1.8, py: 0.7,
                borderRadius: '100px',
                bgcolor: isDark ? 'rgba(15,157,88,0.12)' : 'rgba(15,157,88,0.08)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(15,157,88,0.25)' : 'rgba(15,157,88,0.18)',
              }}>
                <DescriptionRoundedIcon sx={{ fontSize: 15, color: '#0f9d58' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f9d58' }}>
                  {totalFiles} αρχεία
                </Typography>
              </Box>
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.8,
                px: 1.8, py: 0.7,
                borderRadius: '100px',
                bgcolor: isDark ? 'rgba(123,31,162,0.12)' : 'rgba(123,31,162,0.07)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(123,31,162,0.25)' : 'rgba(123,31,162,0.15)',
              }}>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#7b1fa2' }}>
                  {allSemesters.length} εξάμηνα
                </Typography>
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      {/* ── Body ── */}
      <Container maxWidth="md" sx={{ pt: 4, pb: { xs: 12, md: 8 } }}>

        {/* Search + semester tabs */}
        <Box
          ref={tabsRef}
          sx={{
            mb: 4,
            position: 'sticky',
            top: { xs: 56, md: 64 },
            zIndex: 10,
            pt: 1.5,
            pb: 0.5,
            mx: { xs: -2, md: 0 },
            px: { xs: 2, md: 0 },
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            bgcolor: isDark ? 'rgba(22,23,26,0.85)' : 'rgba(248,250,251,0.88)',
          }}
        >
          {/* Search bar */}
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Αναζήτηση μαθήματος..."
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
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '14px',
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                boxShadow: isDark
                  ? 'none'
                  : '0 1px 6px rgba(0,0,0,0.06)',
              },
            }}
          />

          {/* Semester tab pills */}
          <Box sx={{
            display: 'flex',
            gap: 0.75,
            overflowX: 'auto',
            pb: 1,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}>
            <SemTab
              label="Όλα"
              active={activeSem === null}
              onClick={() => setActiveSem(null)}
              color="#1a73e8"
              isDark={isDark}
            />
            {allSemesters.map(s => {
              const palette = SEMESTER_PALETTE[(s - 1) % SEMESTER_PALETTE.length];
              return (
                <SemTab
                  key={s}
                  label={`${s}ο`}
                  active={activeSem === s}
                  onClick={() => setActiveSem(activeSem === s ? null : s)}
                  color={palette.color}
                  isDark={isDark}
                />
              );
            })}
          </Box>
        </Box>

        {/* Content */}
        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} variant="rounded" height={80} sx={{ borderRadius: '16px' }} />
            ))}
          </Stack>
        ) : (
          Object.keys(grouped).length === 0 ? (
            /* Empty state */
            <Box sx={{
              textAlign: 'center',
              py: 10,
              px: 3,
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: '24px',
              mt: 2,
            }}>
              <SearchIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
                Δεν βρέθηκαν μαθήματα
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
                      px: 1.6, py: 0.55,
                      borderRadius: '100px',
                      bgcolor: `${palette.color}15`,
                      border: '1.5px solid',
                      borderColor: `${palette.color}35`,
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
                      {grouped[sem].length} μαθήματα
                    </Typography>
                  </Box>

                  {/* Course cards 2-column grid */}
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 1.5,
                  }}>
                    {grouped[sem].map((course, idx) => {
                      const count = examCounts[course.name] || 0;
                      const isFav = favorites.includes(course.id);
                      return (
                        <CourseCard
                          key={course.id}
                          course={course}
                          count={count}
                          isFav={isFav}
                          user={user}
                          favLoading={favLoading}
                          onToggleFav={toggleFavorite}
                          color={palette.color}
                          isDark={isDark}
                          idx={idx + semIdx * 10}
                        />
                      );
                    })}
                  </Box>
                </Box>
              );
            })
          )
        )}
      </Container>
    </Box>
  );
};

/* ── SemTab pill component ── */
function SemTab({ label, active, onClick, color, isDark }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        px: 1.6,
        py: 0.55,
        borderRadius: '100px',
        fontSize: '0.78rem',
        fontWeight: active ? 800 : 600,
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'all 0.18s ease',
        bgcolor: active
          ? `${color}20`
          : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
        color: active ? color : 'text.secondary',
        border: '1.5px solid',
        borderColor: active ? `${color}45` : 'transparent',
        '&:hover': {
          bgcolor: active ? `${color}25` : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        },
      }}
    >
      {label}
    </Box>
  );
}

/* ── CourseCard component ── */
function CourseCard({ course, count, isFav, user, favLoading, onToggleFav, color, isDark, idx }) {
  return (
    <Link
      to={`/courses/${course.id}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <Box
        sx={{
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
          // Left accent stripe
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '20%',
            bottom: '20%',
            width: '3px',
            borderRadius: '0 3px 3px 0',
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
        }}
      >
        {/* Icon */}
        <Box sx={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          bgcolor: `${color}14`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid',
          borderColor: `${color}20`,
          transition: 'all 0.22s ease',
          '&:hover': { bgcolor: `${color}20` },
        }}>
          <SchoolRoundedIcon sx={{ color, fontSize: 19 }} />
        </Box>

        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: '0.85rem',
            lineHeight: 1.35,
            mb: 0.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}>
            {course.name}
          </Typography>

          {/* File count badge */}
          <Box sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 0.9,
            py: 0.25,
            borderRadius: '8px',
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
                width: 30,
                height: 30,
                color: isFav ? '#d93025' : 'text.disabled',
                transition: 'all 0.15s ease',
                '&:hover': {
                  color: '#d93025',
                  bgcolor: 'rgba(217,48,37,0.09)',
                  transform: 'scale(1.15)',
                },
              }}
            >
              {isFav
                ? <FavoriteIcon sx={{ fontSize: 15 }} />
                : <FavoriteBorderIcon sx={{ fontSize: 15 }} />
              }
            </IconButton>
          )}
          <Box sx={{
            color: 'text.disabled',
            display: 'flex',
            alignItems: 'center',
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

export default Courses;