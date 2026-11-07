import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Upload } from 'lucide-react';
import { HomeStats } from './HomeStats';

export const HomeHero = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pt: { xs: 5, sm: 7, md: 9 },
        pb: { xs: 6, sm: 8, md: 10 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 760 }}>
          <Typography
            component="span"
            sx={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'primary.main',
              mb: 1.5,
            }}
          >
            ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΙΑΣ • ΤΜΗΜΑ ΨΗΦΙΑΚΩΝ ΣΥΣΤΗΜΑΤΩΝ
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
              fontWeight: 800,
              color: 'text.primary',
              lineHeight: 1.12,
              letterSpacing: '-0.03em',
              mb: 2.5,
            }}
          >
            Τράπεζα Θεμάτων & Ακαδημαϊκού Υλικού
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '1rem', sm: '1.0625rem' },
              color: 'text.secondary',
              lineHeight: 1.65,
              maxWidth: 620,
              mb: 4,
            }}
          >
            Κεντρικό αποθετήριο θεμάτων εξετάσεων, σημειώσεων και εκπαιδευτικού
            υλικού. Μοιράσου γνώση και οργάνωσε την προετοιμασία σου για την εξεταστική.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/courses')}
              endIcon={<ArrowRight size={18} />}
              sx={{
                minHeight: 46,
                px: 3,
                py: 1.25,
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9375rem',
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Εξερεύνηση Μαθημάτων
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate('/upload')}
              startIcon={<Upload size={18} />}
              sx={{
                minHeight: 46,
                px: 3,
                py: 1.25,
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9375rem',
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Ανέβασμα Αρχείου
            </Button>
          </Stack>
        </Box>

        <HomeStats />
      </Container>
    </Box>
  );
};

