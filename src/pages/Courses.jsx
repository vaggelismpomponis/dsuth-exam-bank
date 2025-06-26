import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Skeleton, Stack, Divider, useTheme, IconButton, Badge, Chip, Tooltip, TextField, MenuItem, InputAdornment } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SearchIcon from '@mui/icons-material/Search';
<<<<<<< HEAD
=======
import { Link } from 'react-router-dom';
import MuiLink from '@mui/material/Link';
>>>>>>> 0e5f73e (fix: σωστό .gitignore, προστασία admin routes, cleanup node_modules από git, πλήρες setup για prod)

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examCounts, setExamCounts] = useState({});
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]); // ids των αγαπημένων μαθημάτων
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
        // Μετράμε πόσα exams υπάρχουν για κάθε course
        const counts = {};
        data.forEach(e => {
          counts[e.course] = (counts[e.course] || 0) + 1;
        });
        setExamCounts(counts);
      }
    };
    fetchExamCounts();
  }, []);

  // Fetch favorites για τον χρήστη
  useEffect(() => {
    if (!user) return;
    setFavLoading(true);
    supabase
      .from('favorites')
      .select('course_id')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) {
          setFavorites(data.map(f => f.course_id));
        }
        setFavLoading(false);
      });
  }, [user]);

  // Προσθήκη/Αφαίρεση αγαπημένου
  const toggleFavorite = async (courseId) => {
    if (!user) return;
    setFavLoading(true);
    if (favorites.includes(courseId)) {
      // Αφαίρεση
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('course_id', courseId);
      setFavorites(favorites.filter(id => id !== courseId));
    } else {
      // Προσθήκη
      await supabase.from('favorites').insert([{ user_id: user.id, course_id: courseId }]);
      setFavorites([...favorites, courseId]);
    }
    setFavLoading(false);
  };

  // Υπολογισμός φιλτραρισμένων μαθημάτων
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
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" color="primary" gutterBottom align="center" sx={{ fontWeight: 700, letterSpacing: 1 }}>
        Όλα τα Μαθήματα
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, mt: 1, justifyContent: 'center', alignItems: 'center' }}>
        <TextField
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Αναζήτηση μαθήματος..."
          size="small"
          sx={{ minWidth: 220 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
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
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">Όλα</MenuItem>
          {[...Array(8)].map((_, i) => (
            <MenuItem key={i + 1} value={i + 1}>{i + 1}ο Εξάμηνο</MenuItem>
          ))}
        </TextField>
      </Stack>
      {loading ? (
        <Stack spacing={3}>
          {[1,2,3].map(i => <Skeleton key={i} variant="rounded" height={120} />)}
        </Stack>
      ) : (
        Object.keys(grouped).sort((a, b) => a - b).map(sem => (
          <Box key={sem} sx={{ mb: 5 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
<<<<<<< HEAD
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111', letterSpacing: 0.5 }}>{`Εξάμηνο ${sem}`}</Typography>
              <Divider flexItem sx={{ borderColor: '#111', ml: 2 }} />
=======
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#212121', letterSpacing: 0.5 }}>{`Εξάμηνο ${sem}`}</Typography>
              <Divider flexItem sx={{ borderColor: '#212121', ml: 2 }} />
>>>>>>> 0e5f73e (fix: σωστό .gitignore, προστασία admin routes, cleanup node_modules από git, πλήρες setup για prod)
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 3,
              }}
            >
              {grouped[sem].map(course => (
                <Card
                  key={course.id}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 3,
                    boxShadow: 3,
                    background: `linear-gradient(120deg, #f4f6fb 0%, #dbeafe 60%, #f4f6f8 100%)`,
                    backdropFilter: 'blur(1.5px)',
                    border: '1.5px solid #e3eafc',
                    transition: 'transform 0.18s, box-shadow 0.18s, background 0.18s',
                    '&:hover': {
                      boxShadow: 8,
                      transform: 'translateY(-4px) scale(1.03)',
                      background: 'linear-gradient(120deg, #e3eafc 0%, #b6d6fa 60%, #f4f6fb 100%)',
                    },
                    minHeight: { xs: 110, md: 200 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <CardContent sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, px: 2, py: 2, pb: 1 }}>
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <SchoolRoundedIcon color="primary" sx={{ fontSize: 40, flexShrink: 0, mr: 1 }} />
                      <Box sx={{ flexGrow: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/courses/${course.id}`)}>
                        <Typography
                          variant="h6"
                          fontWeight={800}
                          sx={{
                            color: theme.palette.primary.dark,
                            mb: 0.5,
                            fontSize: { xs: '1.1rem', sm: '1.18rem', md: '1.22rem' },
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                          }}
                        >
                          {course.name}
                        </Typography>
                        <Chip label={`Εξάμηνο ${course.semester}`} size="small" sx={{ mt: 0.5, background: '#e3eafc', color: theme.palette.primary.dark, fontWeight: 600, fontSize: '0.95em' }} />
                      </Box>
                    </Box>
                  </CardContent>
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, px: 2, pb: 1, mt: 'auto' }}>
                    <Tooltip title="Διαθέσιμα αρχεία">
                      <Badge badgeContent={examCounts[course.name] || 0} color="info" sx={{ '& .MuiBadge-badge': { fontSize: '0.85em', minWidth: 20, height: 20 } }} showZero>
                        <InsertDriveFileIcon color="action" sx={{ fontSize: 28 }} />
                      </Badge>
                    </Tooltip>
                    {user && (
                      <Tooltip title={favorites.includes(course.id) ? 'Αφαίρεση από αγαπημένα' : 'Προσθήκη στα αγαπημένα'}>
                        <IconButton
                          aria-label={favorites.includes(course.id) ? 'Αφαίρεση από αγαπημένα' : 'Προσθήκη στα αγαπημένα'}
                          onClick={e => { e.stopPropagation(); toggleFavorite(course.id); }}
                          color="error"
                          sx={{ transition: 'transform 0.15s', '&:hover': { transform: 'scale(1.18)' } }}
                          disabled={favLoading}
                        >
                          {favorites.includes(course.id) ? <FavoriteIcon sx={{ fontSize: 28 }} /> : <FavoriteBorderIcon sx={{ fontSize: 28 }} />}
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Card>
              ))}
            </Box>
          </Box>
        ))
      )}
    </Container>
  );
};

export default Courses; 