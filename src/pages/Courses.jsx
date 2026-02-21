import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Skeleton, Stack, Divider, useTheme, IconButton, Badge, Chip, Tooltip, TextField, MenuItem, InputAdornment } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SearchIcon from '@mui/icons-material/Search';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examCounts, setExamCounts] = useState({});
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
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

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 2, md: 5 }, pb: { xs: 12, md: 5 } }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
        Μαθήματα
      </Typography>
      <Typography align="center" sx={{ color: 'text.secondary', mb: 3, fontSize: '0.95rem' }}>
        Βρες αρχεία ανά μάθημα και εξάμηνο
      </Typography>

      {/* Filters */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 4, justifyContent: 'center', alignItems: { sm: 'center' }, width: '100%' }}>
        <TextField
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Αναζήτηση μαθήματος..."
          size="small"
          fullWidth
          sx={{ maxWidth: { sm: 280 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Εξάμηνο"
          value={filterSemester}
          onChange={e => setFilterSemester(e.target.value)}
          size="small"
          fullWidth
          sx={{ maxWidth: { sm: 160 } }}
        >
          <MenuItem value="">Όλα</MenuItem>
          {[...Array(8)].map((_, i) => (
            <MenuItem key={i + 1} value={i + 1}>{i + 1}ο Εξάμηνο</MenuItem>
          ))}
        </TextField>
      </Stack>

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={100} />)}
        </Stack>
      ) : (
        Object.keys(grouped).sort((a, b) => a - b).map(sem => (
          <Box key={sem} sx={{ mb: 5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Chip
                label={`Εξάμηνο ${sem}`}
                size="small"
                sx={{ bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'rgba(255,255,255,0.08)', color: theme.palette.mode === 'light' ? 'primary.main' : '#8ab4f8', fontWeight: 600 }}
              />
              <Divider sx={{ flexGrow: 1 }} />
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              {grouped[sem].map(course => (
                <Link
                  to={`/courses/${course.id}`}
                  key={course.id}
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <Card
                    sx={{
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, p: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.5,
                          bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'rgba(255,255,255,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <SchoolRoundedIcon sx={{ color: theme.palette.mode === 'light' ? 'primary.main' : '#8ab4f8', fontSize: 24 }} />
                        </Box>
                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              color: 'text.primary',
                              fontSize: '0.95rem',
                              wordBreak: 'break-word',
                            }}
                          >
                            {course.name}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, pb: 2 }}>
                      <Tooltip title="Διαθέσιμα αρχεία">
                        <Chip
                          icon={<InsertDriveFileIcon sx={{ fontSize: 16 }} />}
                          label={examCounts[course.name] || 0}
                          size="small"
                          variant="outlined"
                          sx={{ borderColor: 'divider', fontWeight: 600 }}
                        />
                      </Tooltip>
                      {user && (
                        <IconButton
                          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleFavorite(course.id); }}
                          size="small"
                          disabled={favLoading}
                          sx={{
                            color: favorites.includes(course.id) ? '#d93025' : 'text.secondary',
                            transition: 'transform 0.15s',
                            '&:hover': { transform: 'scale(1.15)' },
                          }}
                        >
                          {favorites.includes(course.id) ? <FavoriteIcon sx={{ fontSize: 22 }} /> : <FavoriteBorderIcon sx={{ fontSize: 22 }} />}
                        </IconButton>
                      )}
                    </Box>
                  </Card>
                </Link>
              ))}
            </Box>
          </Box>
        ))
      )}
    </Container>
  );
};

export default Courses;