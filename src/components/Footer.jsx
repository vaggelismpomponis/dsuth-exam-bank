import React from 'react';
import { Box, Typography, Link, Stack, Divider, IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LockIcon from '@mui/icons-material/Lock';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const menuLinks = [
  { label: 'Αρχική', href: '/' },
  { label: 'Μαθήματα', href: '/courses' },
  { label: 'Ανέβασμα Αρχείων', href: '/upload' },
  { label: 'Προφίλ', href: '/profile' },
];

const Footer = () => (
  <Box component="footer" sx={{ width: '100%', mt: 0, background: 'linear-gradient(120deg, #23272f 0%, #2d3340 100%)', color: '#fff', borderTop: 'none', boxShadow: '0 -2px 16px 0 rgba(25, 30, 50, 0.10)' }}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'flex-start' },
        justifyContent: 'space-between',
        gap: { xs: 4, md: 6 },
        width: '100%',
        maxWidth: 1400,
        mx: 'auto',
        py: 4,
        px: { xs: 2, sm: 4, md: 6 },
      }}
    >
      {/* Contact/Logo/Description */}
      <Box flex={1} display="flex" flexDirection="column" alignItems="flex-start" justifyContent="flex-start" minWidth={280}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <img src="/dsuth-favicon.png" alt="DSUth Exam Bank Logo" style={{ height: 80, width: 80, borderRadius: 8, boxShadow: '0 2px 8px rgba(25,30,50,0.10)' }} />
        </Box>
        <Typography variant="body2" sx={{ color: '#b0bec5', fontWeight: 400, maxWidth: 280, lineHeight: 1.6 }}>
          Η Τράπεζα Θεμάτων UTH είναι μια ανοιχτή πλατφόρμα διαμοιρασμού αρχείων εξετάσεων και σημειώσεων για φοιτητές του τμήματος Ψηφιακών Συστημάτων.
        </Typography>
      </Box>
      {/* Menu */}
      <Box flex={1} display="flex" flexDirection="column" alignItems="flex-start" justifyContent="flex-start" minWidth={200}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
          Μενού
        </Typography>
        <Stack spacing={1} alignItems="flex-start">
          {menuLinks.map(link => (
            <Link key={link.href} href={link.href} underline="hover" color="#e3eafc" sx={{ fontSize: '1rem', fontWeight: 500, '&:hover': { color: '#90caf9' } }}>
              {link.label}
            </Link>
          ))}
          <Link href="/faq" underline="hover" color="#e3eafc" sx={{ fontSize: '1rem', fontWeight: 500, '&:hover': { color: '#90caf9' } }}>
            Συχνές Ερωτήσεις
          </Link>
          <Link href="/privacy" underline="hover" color="#e3eafc" sx={{ fontSize: '1rem', fontWeight: 500, '&:hover': { color: '#90caf9' } }}>
            Πολιτική Απορρήτου
          </Link>
        </Stack>
      </Box>
      {/* Contact */}
      <Box flex={1} display="flex" flexDirection="column" alignItems="flex-start" justifyContent="flex-start" minWidth={280}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
          Επικοινωνία
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <EmailIcon sx={{ color: '#90caf9', fontSize: 24 }} />
          <Link href="mailto:dsuthexambank@gmail.com" underline="hover" color="#90caf9" sx={{ fontWeight: 500, fontSize: '1rem', '&:hover': { color: '#e3eafc' } }}>
            dsuthexambank@gmail.com
          </Link>
        </Stack>
      </Box>
    </Box>
    <Divider sx={{ my: 0, borderColor: 'rgba(255,255,255,0.10)' }} />
    <Box sx={{ py: 3, px: 2, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="body2" color="#b0bec5" sx={{ fontWeight: 400, fontSize: '0.95rem' }}>
        © {new Date().getFullYear()} Τράπεζα Θεμάτων UTH
      </Typography>
    </Box>
  </Box>
);

export default Footer; 