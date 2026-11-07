import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import { Mail } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { AppLogo } from './common/AppLogo';

const NAV_LINKS = [
  { href: '/', label: 'Αρχική' },
  { href: '/courses', label: 'Μαθήματα & Υλικό' },
  { href: '/upload', label: 'Ανέβασμα Θεμάτων' },
  { href: '/requests', label: 'Αιτήματα Φοιτητών' },
  { href: '/favorites', label: 'Αγαπημένα' },
];

const LEGAL_LINKS = [
  { href: '/contact#faq', label: 'Συχνές Ερωτήσεις (FAQ)' },
  { href: '/privacy', label: 'Πολιτική Απορρήτου (GDPR)' },
  { href: '/contact', label: 'Επικοινωνία' },
];

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        mt: 'auto',
        pb: { xs: 'calc(76px + env(safe-area-inset-bottom, 0px))', md: 0 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 3, sm: 4, md: 6 }, py: { xs: 6, md: 8 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2.2fr 1fr 1fr' },
            gap: { xs: 4, sm: 5, md: 6 },
          }}
        >
          {/* Brand & Mission */}
          <Box>
            <Box sx={{ mb: 2 }}>
              <AppLogo size={32} showText={true} />
            </Box>

            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7, maxWidth: 360, mb: 2.5 }}>
              Ανοιχτή φοιτητική πλατφόρμα αρχειοθέτησης και διαμοιρασμού παλαιών θεμάτων εξετάσεων και εκπαιδευτικού υλικού.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main', shrink: 0 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Πανεπιστήμιο Θεσσαλίας • Τμήμα Ψηφιακών Συστημάτων
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Link
                href="mailto:dsuthexambank@gmail.com"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  textDecoration: 'none',
                  '&:hover': { color: 'text.primary' },
                }}
              >
                <Mail size={16} />
                <span>Email Υποστήριξης</span>
              </Link>
            </Box>
          </Box>

          {/* Navigation Links */}
          <Box>
            <Typography
              component="h4"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'text.secondary',
                mb: 2,
              }}
            >
              Πλοήγηση
            </Typography>
            <Stack spacing={1.25}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  component={RouterLink}
                  to={link.href}
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Help & Legal Links */}
          <Box>
            <Typography
              component="h4"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'text.secondary',
                mb: 2,
              }}
            >
              Βοήθεια & Νομικά
            </Typography>
            <Stack spacing={1.25}>
              {LEGAL_LINKS.map((link) => (
                <Link
                  key={link.href}
                  component={RouterLink}
                  to={link.href}
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'text.secondary',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Bottom Bar */}
        <Box
          sx={{
            mt: { xs: 5, md: 6 },
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.775rem' }}>
            © {new Date().getFullYear()} DSUth Exam Bank. Ανεξάρτητη φοιτητική πρωτοβουλία.
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
            Πανεπιστήμιο Θεσσαλίας • Τμήμα Ψηφιακών Συστημάτων
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
