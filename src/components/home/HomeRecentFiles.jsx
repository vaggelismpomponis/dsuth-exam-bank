import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import { ArrowRight, RefreshCw, Upload, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHomeExams } from './useHomeExams';
import { HomeRecentFileItem } from './HomeRecentFileItem';

export const HomeRecentFiles = () => {
  const { exams, loading, error, refetch } = useHomeExams();
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      aria-labelledby="recent-files-heading"
      sx={{ py: { xs: 5, sm: 7, md: 8 }, bgcolor: 'background.default' }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
            mb: 3,
          }}
        >
          <Box>
            <Typography
              id="recent-files-heading"
              variant="h2"
              sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}
            >
              Πρόσφατα Αρχεία
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Τελευταία εγκεκριμένα θέματα και σημειώσεις
            </Typography>
          </Box>

          <Button
            size="small"
            onClick={() => navigate('/courses')}
            endIcon={<ArrowRight size={16} />}
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              borderRadius: '8px',
              px: 2,
              py: 0.75,
              color: 'primary.main',
            }}
          >
            Όλα τα μαθήματα
          </Button>
        </Box>

        {loading && (
          <Stack spacing={1.5}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={72}
                sx={{ borderRadius: '12px' }}
              />
            ))}
          </Stack>
        )}

        {!loading && error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={refetch}
                startIcon={<RefreshCw size={15} />}
              >
                Δοκιμή ξανά
              </Button>
            }
            sx={{ borderRadius: '12px' }}
          >
            {error}
          </Alert>
        )}

        {!loading && !error && exams.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              px: 3,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: '12px',
              bgcolor: 'background.paper',
            }}
          >
            <Box sx={{ color: 'text.secondary', display: 'flex', justifyContent: 'center', mb: 1.5 }}>
              <FileText size={36} />
            </Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
              Δεν βρέθηκαν διαθέσιμα αρχεία
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
              Γίνε ο πρώτος που θα συνεισφέρει παλιά θέματα για το τμήμα.
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => navigate('/upload')}
              startIcon={<Upload size={18} />}
              sx={{ borderRadius: '8px', fontWeight: 600 }}
            >
              Ανέβασμα Αρχείου
            </Button>
          </Box>
        )}

        {!loading && !error && exams.length > 0 && (
          <Stack spacing={1.5}>
            {exams.map((exam) => (
              <HomeRecentFileItem key={exam.id} exam={exam} />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

