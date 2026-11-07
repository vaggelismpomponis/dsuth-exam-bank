import React, { useEffect, useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import { Search, Heart, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CourseCard } from '../components/courses/CourseCard';

const Favorites = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examCounts, setExamCounts] = useState({});
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from('favorites')
      .select('course_id')
      .eq('user_id', user.id)
      .then(async ({ data, error }) => {
        if (!error && data) {
          const favIds = data.map((f) => f.course_id);
          setFavorites(favIds);
          if (favIds.length > 0) {
            const { data: courseData } = await supabase
              .from('courses')
              .select('id, name, semester')
              .in('id', favIds);
            setCourses(courseData || []);
          } else {
            setCourses([]);
          }
        }
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    supabase
      .from('exams')
      .select('course, id')
      .eq('approved', true)
      .then(({ data, error }) => {
        if (!error && data) {
          const counts = {};
          data.forEach((e) => {
            counts[e.course] = (counts[e.course] || 0) + 1;
          });
          setExamCounts(counts);
        }
      });
  }, []);

  const toggleFavorite = async (courseId) => {
    if (!user) return;
    if (favorites.includes(courseId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('course_id', courseId);
      setFavorites((prev) => prev.filter((id) => id !== courseId));
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } else {
      await supabase.from('favorites').insert([{ user_id: user.id, course_id: courseId }]);
      setFavorites((prev) => [...prev, courseId]);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [courses, search]);

  if (!loading && !user) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
        <Paper sx={{ width: '100%', maxWidth: 420, p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5, color: 'primary.main' }}>
            <Heart size={36} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Αγαπημένα Μαθήματα</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mb: 3 }}>
            Συνδεθείτε για να αποθηκεύσετε και να δείτε τα μαθήματα που παρακολουθείτε.
          </Typography>
          <Button variant="contained" fullWidth onClick={() => navigate('/login')} sx={{ py: 1.25, borderRadius: '8px', fontWeight: 600 }}>
            Σύνδεση
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default', pb: { xs: 10, md: 6 } }}>
      <Box component="header" sx={{ width: '100%', bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider', pt: { xs: 4, sm: 6 }, pb: { xs: 4, sm: 5 } }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
          <Typography component="span" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'primary.main', mb: 1.5 }}>
            ΠΡΟΣΩΠΙΚΗ ΣΥΛΛΟΓΗ • DSUth
          </Typography>
          <Typography variant="h1" sx={{ fontSize: { xs: '1.875rem', sm: '2.5rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 1 }}>
            Αγαπημένα Μαθήματα
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
            Γρήγορη πρόσβαση στα μαθήματα που παρακολουθείς αυτό το εξάμηνο.
          </Typography>

          <TextField
            fullWidth
            placeholder="Αναζήτηση στα αγαπημένα..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} style={{ color: 'var(--mui-palette-text-secondary, #888)' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ maxWidth: 480, bgcolor: 'background.paper', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 }, pt: 4 }}>
        {loading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} variant="rectangular" height={130} sx={{ borderRadius: '12px' }} />
            ))}
          </Box>
        )}

        {!loading && courses.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8, px: 3, border: '1px dashed', borderColor: 'divider', borderRadius: '12px', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5, color: 'text.secondary' }}>
              <BookOpen size={40} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Δεν έχεις αποθηκεύσει αγαπημένα</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Πάτησε την καρδιά σε οποιοδήποτε μάθημα για να εμφανίζεται εδώ.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/courses')} sx={{ borderRadius: '8px', fontWeight: 600 }}>
              Εξερεύνηση Μαθημάτων
            </Button>
          </Box>
        )}

        {!loading && filteredCourses.length > 0 && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                fileCount={examCounts[course.name] || 0}
                isFavorite={true}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Favorites;
