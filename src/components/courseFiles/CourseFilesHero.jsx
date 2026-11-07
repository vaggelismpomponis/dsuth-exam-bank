import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { ArrowLeft, FileArchive, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSemesterTheme } from '../courses/semesterTheme';

export const CourseFilesHero = ({ course, filesCount = 0, onDownloadAll, isDownloadingAll }) => {
  const navigate = useNavigate();
  const semTheme = getSemesterTheme(course?.semester);

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pt: { xs: 3, sm: 5, md: 6 },
        pb: { xs: 3, sm: 4, md: 5 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
        <Button
          size="small"
          onClick={() => navigate('/courses')}
          startIcon={<ArrowLeft size={16} />}
          sx={{
            mb: 2,
            color: 'text.secondary',
            fontWeight: 600,
            fontSize: '0.8125rem',
            px: 1.5,
            py: 0.5,
            borderRadius: '6px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
          }}
        >
          Πίσω στα Μαθήματα
        </Button>

        <Box sx={{ maxWidth: 760 }}>
          <Typography
            component="span"
            sx={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: semTheme.color,
              mb: 1,
            }}
          >
            {course?.semester ? `${course.semester}ο ΕΞΑΜΗΝΟ • DSUth` : 'ΠΡΟΓΡΑΜΜΑ ΣΠΟΥΔΩΝ'}
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              fontWeight: 800,
              color: 'text.primary',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              mb: 1,
            }}
          >
            {course?.name || 'Φόρτωση μαθήματος...'}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {filesCount > 0
              ? `${filesCount} διαθέσιμα αρχεία θεμάτων και βοηθητικού υλικού.`
              : 'Δεν υπάρχουν ακόμη ανεβασμένα αρχεία για αυτό το μάθημα.'}
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            {filesCount > 0 && onDownloadAll && (
              <Button
                variant="outlined"
                disabled={isDownloadingAll}
                onClick={onDownloadAll}
                startIcon={<FileArchive size={17} />}
                sx={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  minHeight: 42,
                  px: 2.5,
                }}
              >
                {isDownloadingAll ? 'Προετοιμασία zip...' : 'Λήψη Όλων (.zip)'}
              </Button>
            )}

            <Button
              variant="contained"
              onClick={() => navigate('/upload')}
              startIcon={<Upload size={17} />}
              sx={{
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                minHeight: 42,
                px: 2.5,
              }}
            >
              Ανέβασμα Νέου Θέματος
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

