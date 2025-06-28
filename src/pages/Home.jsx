import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, TextField, MenuItem, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Card, CardContent, CardActions, Stack, Grid, Skeleton, Drawer, IconButton, Tooltip, useMediaQuery } from '@mui/material';
import { supabase } from '../supabaseClient';
import SchoolIcon from '@mui/icons-material/School';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SearchIcon from '@mui/icons-material/Search';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const periods = ['Ιανουάριος', 'Ιούνιος', 'Σεπτέμβριος'];

const Home = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allCourses, setAllCourses] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [user, setUser] = useState(null);
  const [examFavorites, setExamFavorites] = useState([]);
  const [favLoading, setFavLoading] = useState(false);
  const [courseFavorites, setCourseFavorites] = useState([]);
  const [favCourseLoading, setFavCourseLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const isMobileOrTablet = windowWidth < 900;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 600;
  const isTablet = windowWidth >= 600 && windowWidth < 900;
  const isDesktop = windowWidth >= 900 && windowWidth < 1536;
  const isUltraWide = windowWidth >= 1536;

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      let query = supabase.from('exams').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(6);
      const { data, error } = await query;
      if (!error) setExams(data);
      setLoading(false);
    };
    fetchExams();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase.from('courses').select('*').order('semester, name', { ascending: true });
      if (!error && data) {
        setAllCourses(data);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites_exams')
      .select('exam_id')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) {
          setExamFavorites(data.map(f => f.exam_id));
        }
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setFavCourseLoading(true);
    supabase
      .from('favorites')
      .select('course_id')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) {
          setCourseFavorites(data.map(f => f.course_id));
        }
        setFavCourseLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (localStorage.getItem('googleLoginSuccess')) {
      enqueueSnackbar('Επιτυχής είσοδος με Google!', { variant: 'success' });
      localStorage.removeItem('googleLoginSuccess');
    }
  }, []);

  const toggleExamFavorite = async (examId) => {
    if (!user) return;
    setFavLoading(true);
    if (examFavorites.includes(examId)) {
      await supabase.from('favorites_exams').delete().eq('user_id', user.id).eq('exam_id', examId);
      setExamFavorites(examFavorites.filter(id => id !== examId));
    } else {
      await supabase.from('favorites_exams').insert([{ user_id: user.id, exam_id: examId }]);
      setExamFavorites([...examFavorites, examId]);
    }
    setFavLoading(false);
  };

  const toggleCourseFavorite = async (courseId) => {
    if (!user) return;
    setFavCourseLoading(true);
    if (courseFavorites.includes(courseId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('course_id', courseId);
      setCourseFavorites(courseFavorites.filter(id => id !== courseId));
    } else {
      await supabase.from('favorites').insert([{ user_id: user.id, course_id: courseId }]);
      setCourseFavorites([...courseFavorites, courseId]);
    }
    setFavCourseLoading(false);
  };

  return (
    <Box sx={{
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e3f0ff 0%, #f9fbff 100%)',
      py: { xs: 0, sm: 0, md: 0 },
      overflowX: 'hidden',
      px: 0,
      overflowY: 'auto',
    }}>
      {/* Hero section */}
      <Box
        sx={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          maxWidth: '100vw',
          boxShadow: '0 2px 8px 0 rgba(31,38,135,0.03)',
          borderRadius: 0,
          p: { xs: 2.5, sm: 5, md: 7 },
          mb: { xs: 4, md: 6 },
          minHeight: { xs: 320, md: 340 },
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(120deg, #f4f6fb 0%, #dbeafe 60%, #f4f6f8 100%)',
          border: '1.5px solid #e3eafc',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 700, textAlign: { xs: 'center', md: 'left' }, mx: 'auto' }}>
          <Typography
            variant={isMobile ? 'h5' : isTablet ? 'h3' : isUltraWide ? 'h1' : 'h2'}
            color="#212121"
            gutterBottom
            noWrap={false}
            sx={{
              fontWeight: 900,
              mb: 1,
              letterSpacing: '-1px',
              fontSize: isUltraWide ? '3.2rem' : undefined,
              whiteSpace: !isMobile ? 'nowrap' : 'normal',
              wordBreak: 'normal',
              display: 'block',
              width: '100%',
              maxWidth: '100%',
              color: '#212121',
            }}
          >
            <SchoolIcon sx={{ fontSize: { xs: 36, md: 56, xl: 72 }, mr: 1, mb: -0.5, color: '#1976d2', verticalAlign: 'middle' }} />
            DSUth Exam Bank
          </Typography>
          <Typography
            variant={isMobile ? 'body1' : 'h5'}
            sx={{ mb: 2, color: '#212121', fontWeight: 600, fontSize: isUltraWide ? '1.7rem' : undefined }}
          >
            ΨΗΦΙΑΚΑ ΣΥΣΤΗΜΑΤΑ, ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΙΑΣ
          </Typography>
          <Typography
            variant="body1"
            sx={{ mb: 3, color: '#212121', maxWidth: 600, fontSize: isUltraWide ? '1.25rem' : undefined, fontWeight: 500, mx: { xs: 'auto', md: 0 } }}
          >
            Βρες, κατέβασε ή μοιράσου θέματα και αρχεία προηγούμενων εξετάσεων της σχολής. Η γνώση ανήκει σε όλους!
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2, width: '100%', maxWidth: 500, mx: { xs: 'auto', md: 0 } }}>
            {user ? (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<UploadFileIcon />}
                href="/upload"
                sx={{
                  fontWeight: 700,
                  fontSize: isUltraWide ? '1.2rem' : undefined,
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  boxShadow: 'none',
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    backgroundColor: '#115293',
                    color: '#fff',
                    boxShadow: 'none',
                  },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                ΑΝΕΒΑΣΕ ΘΕΜΑ
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="large"
                href="/login"
                sx={{
                  fontWeight: 700,
                  fontSize: isUltraWide ? '1.2rem' : undefined,
                  px: 3,
                  py: 1.2,
                  borderRadius: 2,
                  backgroundColor: '#1976d2',
                  color: '#fff',
                  boxShadow: 'none',
                  transition: 'background 0.2s, color 0.2s',
                  '&:hover': {
                    backgroundColor: '#115293',
                    color: '#fff',
                    boxShadow: 'none',
                  },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                ΣΥΝΔΕΣΗ ΓΙΑ ΑΝΕΒΑΣΜΑ
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              size="large"
              startIcon={<MenuBookIcon />}
              href="/courses"
              sx={{
                fontWeight: 700,
                fontSize: isUltraWide ? '1.2rem' : undefined,
                px: 3,
                py: 1.2,
                borderRadius: 2,
                backgroundColor: 'transparent',
                color: '#1976d2',
                borderWidth: 2,
                borderColor: '#1976d2',
                boxShadow: 'none',
                transition: 'background 0.2s, color 0.2s',
                '&:hover': {
                  backgroundColor: '#e3f0ff',
                  color: '#115293',
                  borderColor: '#115293',
                  boxShadow: 'none',
                },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              ΔΕΣ ΤΑ ΜΑΘΗΜΑΤΑ 
            </Button>
          </Stack>
        </Box>
      </Box>
      {/* Φίλτρα + Λίστα */}
      <Container
        disableGutters
        maxWidth={false}
        sx={{
          mt: 0,
          mb: 0,
          pl: { xs: 3, sm: 5, md: 7 },
          pr: { xs: 3, sm: 5, md: 7 },
          width: '100%',
          maxWidth: 1100,
          mx: 'auto',
          overflowX: 'clip',
          pb: { xs: 4, md: 6 },
        }}
      >
        <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 3, color: '#212121', letterSpacing: 0.5 }}>
          Δες τα τελευταία αρχεία που προστέθηκαν στην τράπεζα θεμάτων
        </Typography>
        {loading ? (
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          </Box>
        ) : isMobileOrTablet ? (
          <Stack spacing={2} sx={{ mt: 2 }}>
            {exams.length === 0 ? (
              <Typography align="center">Δεν βρέθηκαν αρχεία.</Typography>
            ) : (
              exams.map((exam) => {
                const courseObj = allCourses.find(c => c.name === exam.course);
                const courseId = courseObj ? courseObj.id : null;
                return (
                  <Box key={exam.id} sx={{ background: '#f8fafc', boxShadow: '0 2px 12px 0 rgba(31,38,135,0.08)', borderRadius: '18px', border: '1px solid #e3eafc', p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Μάθημα: <span style={{ fontWeight: 400 }}>{exam.course}</span>
                      </Typography>
                      {user && courseId && (
                        <IconButton
                          color={courseFavorites.includes(courseId) ? 'error' : 'default'}
                          onClick={() => toggleCourseFavorite(courseId)}
                          disabled={favCourseLoading}
                          sx={{ borderRadius: 1, ml: 0.5 }}
                          size="small"
                        >
                          {courseFavorites.includes(courseId) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                        </IconButton>
                      )}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Έτος: <span style={{ fontWeight: 400 }}>{exam.year}</span></Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Εξεταστική: <span style={{ fontWeight: 400 }}>{exam.period}</span></Typography>
                    <Box sx={{ mt: 1 }}>
                      <Button color="info" size="small" href={exam.file_url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', background: '#e3f2fd', borderRadius: 1, '&:hover': { background: '#bbdefb' }, mr: 1 }}><VisibilityIcon /></Button>
                      <Button color="primary" size="small" href={exam.file_url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', background: '#e3eafc', borderRadius: 1, '&:hover': { background: '#c5cae9' }, mr: 1 }}><DownloadIcon /></Button>
                    </Box>
                  </Box>
                );
              })
            )}
          </Stack>
        ) : (
          <TableContainer component={Paper} sx={{ background: '#f8fafc', boxShadow: '0 2px 12px 0 rgba(31,38,135,0.08)', borderRadius: '18px', border: '1px solid #e3eafc', mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#212121', fontSize: 16 }}>Μάθημα</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#212121', fontSize: 16 }}>Έτος</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#212121', fontSize: 16 }}>Εξεταστική</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#212121', fontSize: 16 }}>Ενέργειες</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center">Δεν βρέθηκαν αρχεία.</TableCell></TableRow>
                ) : exams.map((exam) => {
                  const courseObj = allCourses.find(c => c.name === exam.course);
                  const courseId = courseObj ? courseObj.id : null;
                  return (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {exam.course}
                          {user && courseId && (
                            <IconButton
                              color={courseFavorites.includes(courseId) ? 'error' : 'default'}
                              onClick={() => toggleCourseFavorite(courseId)}
                              disabled={favCourseLoading}
                              sx={{ borderRadius: 1, ml: 0.5 }}
                              size="small"
                            >
                              {courseFavorites.includes(courseId) ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{exam.year}</TableCell>
                      <TableCell>{exam.period}</TableCell>
                      <TableCell>
                        <Button color="info" size="small" href={exam.file_url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', background: '#e3f2fd', borderRadius: 1, '&:hover': { background: '#bbdefb' }, mr: 1 }}><VisibilityIcon /></Button>
                        <Button color="primary" size="small" href={exam.file_url} target="_blank" rel="noopener noreferrer" sx={{ textTransform: 'none', background: '#e3eafc', borderRadius: 1, '&:hover': { background: '#c5cae9' }, mr: 1 }}><DownloadIcon /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
      {/* Call to Action: Προτροπή για ανέβασμα αρχείων */}
      <Box
        sx={{
          mt: 4,
          mb: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(120deg, #e3eafc 60%, #f4f6f8 100%)',
          boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.10)',
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 4, sm: 5 },
          width: '100%',
          borderRadius: 0,
        }}
      >
        <Typography variant="h6" align="center" sx={{ fontWeight: 700, mb: 2, color: '#1976d2', letterSpacing: 0.5, textTransform: 'none' }}>
          Έχεις παλιότερα θέματα ή αρχεία εξετάσεων;
        </Typography>
        <Typography align="center" sx={{ mb: 2, color: '#212121', maxWidth: 500, textTransform: 'none' }}>
          Βοήθησε κι εσύ την κοινότητα στέλνοντας τα δικά σου αρχεία! Η γνώση ανήκει σε όλους.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<UploadFileIcon />}
          href={user ? "/upload" : "/login"}
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.1rem', sm: '1.15rem' },
            px: 4,
            py: 1.5,
            borderRadius: 2,
            backgroundColor: '#1976d2',
            color: '#fff',
            boxShadow: 'none',
            transition: 'background 0.2s, color 0.2s',
            '&:hover': {
              backgroundColor: '#115293',
              color: '#fff',
              boxShadow: 'none',
            },
            mt: 1,
            textTransform: 'none',
          }}
        >
          Ανέβασε θέμα ή αρχείο
        </Button>
      </Box>

      {/* Δυνατότητες Χρηστών */}
      <Container
        maxWidth="lg"
        sx={{
          mb: 6,
          px: { xs: 3, sm: 5, md: 7 },
        }}
      >
        <Typography 
          variant="h5" 
          align="center" 
          sx={{ 
            fontWeight: 800, 
            mb: 1, 
            color: '#212121', 
            letterSpacing: 0.5,
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}
        >
          Δυνατότητες της Πλατφόρμας
        </Typography>
        <Typography 
          align="center" 
          sx={{ 
            mb: 4, 
            color: '#666', 
            maxWidth: 600, 
            mx: 'auto',
            fontSize: { xs: '1rem', md: '1.1rem' }
          }}
        >
          Ανακαλύψτε όλες τις δυνατότητες που σας προσφέρει η τράπεζα θεμάτων
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
            gridAutoRows: '1fr',
            mb: 6,
          }}
        >
          {/* Αναζήτηση και Προσθήκη */}
          <Box sx={{ display: 'flex', height: '100%' }}>
            <Card 
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                border: '1px solid #e1f5fe',
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <UploadFileIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: '#1976d2', 
                      mb: 2,
                      background: 'rgba(25, 118, 210, 0.1)',
                      borderRadius: '50%',
                      p: 1
                    }} 
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
                    Ανέβασμα Αρχείων
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    Προσθέστε θέματα και αρχεία εξετάσεων για να βοηθήσετε την κοινότητα
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  href="/upload"
                  sx={{ 
                    borderColor: '#1976d2', 
                    color: '#1976d2',
                    '&:hover': { borderColor: '#115293', backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                  }}
                >
                  Ανέβασε Αρχείο
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Περιήγηση Μαθημάτων */}
          <Box sx={{ display: 'flex', height: '100%' }}>
            <Card 
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                border: '1px solid #e8f5e8',
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <MenuBookIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: '#2e7d32', 
                      mb: 2,
                      background: 'rgba(46, 125, 50, 0.1)',
                      borderRadius: '50%',
                      p: 1
                    }} 
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
                    Περιήγηση Μαθημάτων
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    Εξερευνήστε όλα τα μαθήματα και τα διαθέσιμα αρχεία εξετάσεων
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  href="/courses"
                  sx={{ 
                    borderColor: '#2e7d32', 
                    color: '#2e7d32',
                    '&:hover': { borderColor: '#1b5e20', backgroundColor: 'rgba(46, 125, 50, 0.04)' }
                  }}
                >
                  Δες Μαθήματα
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Αγαπημένα */}
          <Box sx={{ display: 'flex', height: '100%' }}>
            <Card 
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                background: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 100%)',
                border: '1px solid #fce4ec',
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <FavoriteIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: '#c2185b', 
                      mb: 2,
                      background: 'rgba(194, 24, 91, 0.1)',
                      borderRadius: '50%',
                      p: 1
                    }} 
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
                    Αγαπημένα
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    Αποθηκεύστε τα αγαπημένα σας μαθήματα και αρχεία για γρήγορη πρόσβαση
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  href="/favorites"
                  sx={{ 
                    borderColor: '#c2185b', 
                    color: '#c2185b',
                    '&:hover': { borderColor: '#880e4f', backgroundColor: 'rgba(194, 24, 91, 0.04)' }
                  }}
                >
                  Δες Αγαπημένα
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Προφίλ Χρήστη */}
          <Box sx={{ display: 'flex', height: '100%' }}>
            <Card 
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                background: 'linear-gradient(135deg, #fff3e0 0%, #fbe9e7 100%)',
                border: '1px solid #fff3e0',
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <PersonIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: '#f57c00', 
                      mb: 2,
                      background: 'rgba(245, 124, 0, 0.1)',
                      borderRadius: '50%',
                      p: 1
                    }} 
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
                    Προφίλ Χρήστη
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    Διαχειριστείτε το προφίλ σας και δείτε την δραστηριότητά σας
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  href="/profile"
                  sx={{ 
                    borderColor: '#f57c00', 
                    color: '#f57c00',
                    '&:hover': { borderColor: '#e65100', backgroundColor: 'rgba(245, 124, 0, 0.04)' }
                  }}
                >
                  Δες Προφίλ
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* Ασφάλεια */}
          <Box sx={{ display: 'flex', height: '100%' }}>
            <Card 
              sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                background: 'linear-gradient(135deg, #e0f2f1 0%, #e8f5e8 100%)',
                border: '1px solid #e0f2f1',
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                }
              }}
            >
              <CardContent sx={{ p: 3, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <SecurityIcon 
                    sx={{ 
                      fontSize: 48, 
                      color: '#00695c', 
                      mb: 2,
                      background: 'rgba(0, 105, 92, 0.1)',
                      borderRadius: '50%',
                      p: 1
                    }} 
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#212121' }}>
                    Ασφάλεια & Επικύρωση
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                    Όλα τα αρχεία επικυρώνονται πριν δημοσιευθούν για την ποιότητα του περιεχομένου
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small" 
                  disabled
                  sx={{ 
                    borderColor: '#00695c', 
                    color: '#00695c',
                    opacity: 0.7
                  }}
                >
                  Αυτόματη Επικύρωση
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home; 