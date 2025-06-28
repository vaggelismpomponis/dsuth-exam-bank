import React from 'react';
import { Box, Typography, Link, Stack, Divider } from '@mui/material';

const menuLinks = [
  { label: 'Αρχική', href: '/' },
  { label: 'Μαθήματα', href: '/courses' },
  { label: 'Ανέβασμα', href: '/upload' },
  { label: 'Προφίλ', href: '/profile' },
];

const Footer = () => (
  <Box component="footer" sx={{ width: '100%', mt: 0, background: 'rgba(40,40,40,0.04)', borderTop: '1px solid #e0e0e0' }}>
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 4 }, py: { xs: 5, sm: 7 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 6, sm: 10, md: 16 }}
        alignItems="center"
        justifyContent="center"
        divider={<Divider orientation={window.innerWidth < 600 ? 'horizontal' : 'vertical'} flexItem sx={{ borderColor: 'rgba(40,40,40,0.10)' }} />}
      >
        <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 700, textAlign: 'center', minHeight: 32 }}>
            Επικοινωνία
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Email: <Link href="mailto:dsuthexambank@gmail.com" underline="hover">dsuthexambank@gmail.com</Link>
          </Typography>
        </Box>
        <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 700, textAlign: 'center', minHeight: 32 }}>
            Μενού
          </Typography>
          <Stack spacing={0.5} alignItems="center">
            {menuLinks.map(link => (
              <Link key={link.href} href={link.href} underline="hover" color="text.secondary" sx={{ fontSize: '1rem' }}>
                {link.label}
              </Link>
            ))}
            <Link href="/faq" underline="hover" color="text.secondary" sx={{ fontSize: '1rem' }}>
              Συχνές Ερωτήσεις
            </Link>
            <Link href="/privacy" underline="hover" color="text.secondary" sx={{ fontSize: '1rem', ml: 2 }}>
              Πολιτική Απορρήτου
            </Link>
          </Stack>
        </Box>
        <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
          <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 700, textAlign: 'center', minHeight: 32 }}>
            Social & Project
          </Typography>
          <Stack spacing={0.5} alignItems="center">
            <Link href="https://github.com/Vaggelisbob/dsuth-exam-bank" target="_blank" rel="noopener" underline="hover" color="text.secondary">
              GitHub Project
            </Link>
          </Stack>
        </Box>
      </Stack>
    </Box>
    <Divider sx={{ my: 0 }} />
    <Box sx={{ py: 2, px: 2, background: 'rgba(40,40,40,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400 }}>
          © {new Date().getFullYear()} Τράπεζα Θεμάτων UTH
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400 }}>
          | Developed by <Link href="https://github.com/Vaggelisbob/dsuth-exam-bank" target="_blank" rel="noopener" underline="hover">Vaggelis Mpomponis</Link>
        </Typography>
      </Stack>
    </Box>
  </Box>
);

export default Footer; 