import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { Upload, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomeCta = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      aria-labelledby="contribution-heading"
      sx={{ py: { xs: 5, sm: 7, md: 8 }, bgcolor: 'background.default' }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
        <Paper
          sx={{
            p: { xs: 3.5, sm: 5, md: 6 },
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            textAlign: { xs: 'left', sm: 'center' },
          }}
        >
          <Box sx={{ maxWidth: 620, mx: { xs: 0, sm: 'auto' }, mb: 3.5 }}>
            <Typography
              id="contribution-heading"
              variant="h2"
              sx={{
                fontSize: { xs: '1.35rem', sm: '1.75rem' },
                fontWeight: 800,
                color: 'text.primary',
                letterSpacing: '-0.02em',
                mb: 1.5,
              }}
            >
              Έχεις παλιά θέματα εξετάσεων;
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', lineHeight: 1.65, fontSize: '0.95rem' }}
            >
              Βοήθησε τους συμφοιτητές σου εμπλουτίζοντας την τράπεζα με νέο υλικό.
              Η συλλογική γνώση διευκολύνει την προετοιμασία όλων.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="medium"
              onClick={() => navigate('/upload')}
              startIcon={<Upload size={18} />}
              sx={{
                minHeight: 44,
                px: 3,
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9375rem',
              }}
            >
              Ανέβασμα Αρχείου
            </Button>
            <Button
              variant="outlined"
              size="medium"
              onClick={() => navigate('/contact')}
              startIcon={<Mail size={18} />}
              sx={{
                minHeight: 44,
                px: 3,
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9375rem',
              }}
            >
              Επικοινωνία
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

