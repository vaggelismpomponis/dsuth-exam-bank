import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import { ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HomeAdminBanner = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      aria-labelledby="admin-application-heading"
      sx={{ pb: { xs: 6, sm: 8, md: 10 }, bgcolor: 'background.default' }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
        <Paper
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
            <Box sx={{ color: 'primary.main', mt: 0.25, shrink: 0 }}>
              <ShieldCheck size={24} />
            </Box>
            <Box>
              <Typography
                id="admin-application-heading"
                component="h3"
                variant="subtitle1"
                sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem', mb: 0.25 }}
              >
                Συμμετοχή στη Διαχειριστική Ομάδα
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
                Ενδιαφέρεσαι να συνεισφέρεις στην έγκριση αρχείων και τη συντήρηση της πλατφόρμας;
                Συμπλήρωσε τη φόρμα για δικαιώματα διαχειριστή.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="outlined"
            size="small"
            onClick={() => navigate('/admin-application')}
            sx={{
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              px: 2.5,
              py: 1,
              width: { xs: '100%', sm: 'auto' },
              shrink: 0,
            }}
          >
            Αίτηση Admin
          </Button>
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
            Τα θέματα προέρχονται από το{' '}
            <Box
              component="a"
              href="https://dsuth-exambank.gitlab.io/"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
            >
              dsuth exam bank
            </Box>
            {' '}και το{' '}
            <Box
              component="a"
              href="https://drive.google.com/drive/folders/0B5ICraEWxrM1NjBuWG9kZlJuWGc?resourcekey=0-zoL2-dVJmJioaH3UZkqMYg"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main', fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
            >
              Google Drive
            </Box>
            .
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

