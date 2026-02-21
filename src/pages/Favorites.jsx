import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Skeleton, Stack, Divider, Chip, Tooltip, Alert, Button, Paper } from '@mui/material';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useTheme } from '@mui/material/styles';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Favorites = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examCounts, setExamCounts] = useState({});
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data?.session?.user || null));
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase.from('favorites').select('course_id').eq('user_id', user.id)
      .then(async ({ data, error }) => {
        if (!error && data) {
          const favIds = data.map(f => f.course_id);
          if (favIds.length > 0) {
            const { data: courseData } = await supabase.from('courses').select('*').in('id', favIds);
            setCourses(courseData || []);
          } else setCourses([]);
        }
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    const fetchExamCounts = async () => {
      const { data, error } = await supabase.from('exams').select('course, id', { count: 'exact', head: false }).eq('approved', true);
      if (!error && data) {
        const counts = {};
        data.forEach(e => { counts[e.course] = (counts[e.course] || 0) + 1; });
        setExamCounts(counts);
      }
    };
    fetchExamCounts();
  }, []);

  const grouped = courses.reduce((acc, course) => {
    acc[course.semester] = acc[course.semester] || [];
    acc[course.semester].push(course);
    return acc;
  }, {});

  if (!user) return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4, px: 2 }}>
      <Paper sx={{ width: '100%', maxWidth: 420, p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
        <FavoriteIcon sx={{ fontSize: 48, color: '#d93025', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Αγαπημένα</Typography>
        <Alert severity="info" sx={{ mb: 2.5, textAlign: 'center' }}>
          Για να δείτε τα αγαπημένα σας, πρέπει να συνδεθείτε.
        </Alert>
        <Button variant="contained" fullWidth onClick={() => navigate('/login')} sx={{ py: 1.3 }}>
          Σύνδεση
        </Button>
      </Paper>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 2, md: 5 }, pb: { xs: 12, md: 5 } }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
        Αγαπημένα
      </Typography>
      <Typography align="center" sx={{ color: 'text.secondary', mb: 3, fontSize: '0.95rem' }}>
        Τα μαθήματα που έχετε αποθηκεύσει
      </Typography>

      {loading ? (
        <Stack spacing={2}>{[1, 2, 3].map(i => <Skeleton key={i} variant="rounded" height={80} />)}</Stack>
      ) : courses.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <FavoriteIcon sx={{ fontSize: 56, color: 'text.secondary', opacity: 0.3, mb: 1 }} />
          <Typography sx={{ color: 'text.secondary' }}>Δεν έχετε αγαπημένα μαθήματα.</Typography>
        </Box>
      ) : (
        Object.keys(grouped).sort((a, b) => a - b).map(sem => (
          <Box key={sem} sx={{ mb: 5 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
              <Chip label={`Εξάμηνο ${sem}`} size="small" sx={{ bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'rgba(255,255,255,0.08)', color: theme.palette.mode === 'light' ? 'primary.main' : '#8ab4f8', fontWeight: 600 }} />
              <Divider sx={{ flexGrow: 1 }} />
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {grouped[sem].map(course => (
                <Link to={`/courses/${course.id}`} key={course.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <Card sx={{
                    cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
                  }}>
                    <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, p: 2.5 }}>
                      <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: theme.palette.mode === 'light' ? '#e8f0fe' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <SchoolRoundedIcon sx={{ color: theme.palette.mode === 'light' ? 'primary.main' : '#8ab4f8', fontSize: 24 }} />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem', wordBreak: 'break-word' }}>
                        {course.name}
                      </Typography>
                    </CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, pb: 2 }}>
                      <Tooltip title="Διαθέσιμα αρχεία">
                        <Chip icon={<InsertDriveFileIcon sx={{ fontSize: 16 }} />} label={examCounts[course.name] || 0} size="small" variant="outlined" sx={{ borderColor: 'divider', fontWeight: 600 }} />
                      </Tooltip>
                      <FavoriteIcon sx={{ color: '#d93025', fontSize: 22 }} />
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

export default Favorites;