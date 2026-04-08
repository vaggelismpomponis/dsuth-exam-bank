import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Skeleton, Stack,
  Divider, useTheme, IconButton, Chip, TextField, InputAdornment
} from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FilterListIcon from '@mui/icons-material/FilterList';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examCounts, setExamCounts] = useState({});
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [search, setSearch] = useState('');
  const [filterSemester, setFilterSemester] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('courses').select('*').order('semester, name', { ascending: true });
      if (!error && data) setCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchExamCounts = async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('course, id', { count: 'exact', head: false })
        .eq('approved', true);
      if (!error && data) {
        const counts = {};
        data.forEach(e => { counts[e.course] = (counts[e.course] || 0) + 1; });
        setExamCounts(counts);
      }
    };
    fetchExamCounts();
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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(search.toLowerCase());
    const matchesSemester = filterSemester ? course.semester === Number(filterSemester) : true;
    return matchesSearch && matchesSemester;
  });

  const grouped = filteredCourses.reduce((acc, course) => {
    acc[course.semester] = acc[course.semester] || [];
    acc[course.semester].push(course);
    return acc;
  }, {});

  const semesterColors = [
    '#1a73e8', '#1e8e3e', '#ea8600', '#d93025',
    '#7b1fa2', '#00796b', '#c62828', '#1565c0',
  ];

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 3, md: 5 }, pb: { xs: 12, md: 8 } }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em', mb: 1, fontSize: { xs: '1.8rem', md: '2.2rem' } }}
        >
          Μαθήματα
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', maxWidth: 400, mx: 'auto' }}>
          Βρες αρχεία εξετάσεων ανά μάθημα και εξάμηνο
        </Typography>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          mb: 5,
          p: 2,
          borderRadius: '16px',
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#f8f9fa',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
        }}
      >
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
            '& .MuiOutlinedInput-root': {
              bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
              borderRadius: '10px',
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', flexShrink: 0 }}>
          <Chip
            label="Όλα"
            size="small"
            onClick={() => setFilterSemester('')}
            sx={{
              fontWeight: filterSemester === '' ? 700 : 500,
              cursor: 'pointer',
              bgcolor: filterSemester === ''
                ? isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.1)'
                : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              color: filterSemester === '' ? 'primary.main' : 'text.secondary',
              border: filterSemester === '' ? '1px solid' : 'none',
              borderColor: 'primary.main',
            }}
          />
          {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
            <Chip
              key={s}
              label={`${s}ο`}
              size="small"
              onClick={() => setFilterSemester(String(s) === filterSemester ? '' : String(s))}
              sx={{
                fontWeight: filterSemester === String(s) ? 700 : 500,
                cursor: 'pointer',
                bgcolor: filterSemester === String(s)
                  ? isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.1)'
                  : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                color: filterSemester === String(s) ? 'primary.main' : 'text.secondary',
                border: filterSemester === String(s) ? '1px solid' : 'none',
                borderColor: 'primary.main',
              }}
            />
          ))}
        </Box>
      </Box>

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} variant="rounded" height={110} sx={{ borderRadius: '14px' }} />
          ))}
        </Stack>
      ) : (
        Object.keys(grouped).sort((a, b) => a - b).map((sem, semIdx) => {
          const color = semesterColors[(Number(sem) - 1) % semesterColors.length];
          return (
            <Box key={sem} sx={{ mb: 5 }}>
              {/* Semester header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: '10px',
                    bgcolor: `${color}15`,
                    border: '1px solid',
                    borderColor: `${color}30`,
                  }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color }}>
                    {sem}ο Εξάμηνο
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, height: 1, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)' }} />
                <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', fontWeight: 500 }}>
                  {grouped[sem].length} μαθήματα
                </Typography>
              </Box>

              {/* Cards grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                {grouped[sem].map((course, idx) => {
                  const count = examCounts[course.name] || 0;
                  const isFav = favorites.includes(course.id);
                  return (
                    <Link
                      to={`/courses/${course.id}`}
                      key={course.id}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                    >
                      <Box
                        sx={{
                          p: '16px 18px',
                          borderRadius: '14px',
                          bgcolor: isDark ? 'rgba(255,255,255,0.025)' : '#fff',
                          border: '1px solid',
                          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: isDark ? '0 8px 28px rgba(0,0,0,0.3)' : '0 8px 28px rgba(0,0,0,0.08)',
                            borderColor: isDark ? `${color}50` : `${color}30`,
                          },
                        }}
                      >
                        {/* Icon */}
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: '12px',
                            bgcolor: `${color}12`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <SchoolRoundedIcon sx={{ color, fontSize: 20 }} />
                        </Box>

                        {/* Text */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: 'text.primary',
                              fontSize: '0.875rem',
                              lineHeight: 1.3,
                              mb: 0.4,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {course.name}
                          </Typography>
                          <Chip
                            icon={<InsertDriveFileIcon sx={{ fontSize: '12px !important' }} />}
                            label={`${count} αρχεία`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              bgcolor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)',
                              color: 'text.secondary',
                              '& .MuiChip-label': { px: 0.8 },
                              '& .MuiChip-icon': { ml: 0.5 },
                            }}
                          />
                        </Box>

                        {/* Right actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                          {user && (
                            <IconButton
                              onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(course.id); }}
                              size="small"
                              disabled={favLoading}
                              sx={{
                                width: 30,
                                height: 30,
                                color: isFav ? '#d93025' : 'text.disabled',
                                '&:hover': { color: '#d93025', bgcolor: 'rgba(217,48,37,0.08)' },
                                transition: 'all 0.15s',
                              }}
                            >
                              {isFav ? <FavoriteIcon sx={{ fontSize: 17 }} /> : <FavoriteBorderIcon sx={{ fontSize: 17 }} />}
                            </IconButton>
                          )}
                          <Box sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center' }}>
                            <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
                          </Box>
                        </Box>
                      </Box>
                    </Link>
                  );
                })}
              </Box>
            </Box>
          );
        })
      )}

      {!loading && Object.keys(grouped).length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            px: 3,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: '20px',
          }}
        >
          <SearchIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
            Δεν βρέθηκαν μαθήματα
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Δοκιμάστε διαφορετικούς όρους αναζήτησης
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Courses;