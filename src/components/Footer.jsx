import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import { Mail, Wallet, ExternalLink, Users } from 'lucide-react';
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

        {/* Spendlore Spotlight */}
        <Box
          sx={{
            mt: { xs: 5, md: 6 },
            p: { xs: 2.5, sm: 3 },
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'action.hover',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ maxWidth: 680 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Wallet size={16} className="text-primary shrink-0" />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                }}
              >
                Spendlore
              </Typography>
              <Box
                component="span"
                sx={{
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  px: 0.7,
                  py: 0.15,
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: 'divider',
                  color: 'text.secondary',
                  lineHeight: 1.2,
                }}
              >
                BETA
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.55 }}>
              Συνεργαζόμενη εφαρμογή έξυπνης διαχείρισης προσωπικών οικονομικών και φοιτητικού προϋπολογισμού. Καταγράψτε έσοδα, έξοδα και δείτε στατιστικά στο Web & κινητό.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.25, shrink: 0 }}>
            <Button
              component="a"
              href="https://groups.google.com/g/spendlore-beta-testers"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="small"
              startIcon={<Users size={14} />}
              endIcon={<ExternalLink size={13} />}
              sx={{
                minHeight: 36,
                px: 2,
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.8125rem',
                whiteSpace: 'nowrap',
                textTransform: 'none',
              }}
            >
              Γίνε Tester (Android)
            </Button>

            <Button
              component="a"
              href="https://app.spendlore.gr/"
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              size="small"
              startIcon={<Wallet size={15} />}
              endIcon={<ExternalLink size={13} />}
              sx={{
                minHeight: 36,
                px: 2,
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8125rem',
                whiteSpace: 'nowrap',
                textTransform: 'none',
              }}
            >
              Άνοιγμα Spendlore
            </Button>
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
