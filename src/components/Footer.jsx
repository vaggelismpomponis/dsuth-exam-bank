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
  { label: 'Ανέβασμα', href: '/upload' },
  { label: 'Προφίλ', href: '/profile' },
];

const Footer = () => (
  <Box component="footer" sx={{ width: '100%', mt: 0, background: 'linear-gradient(120deg, #23272f 0%, #2d3340 100%)', color: '#fff', borderTop: 'none', boxShadow: '0 -2px 16px 0 rgba(25, 30, 50, 0.10)' }}>
    <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 2, sm: 4 }, py: { xs: 6, sm: 8 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 6, sm: 10, md: 16 }}
        alignItems="flex-start"
        justifyContent="center"
        divider={<Divider orientation={window.innerWidth < 600 ? 'horizontal' : 'vertical'} flexItem sx={{ borderColor: 'rgba(255,255,255,0.10)' }} />}
      >
        {/* Contact/Logo/Description */}
        <Box flex={1} display="flex" flexDirection="column" alignItems="flex-start" justifyContent="center" minWidth={220}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <img src="/public/dsuth-favicon.png" alt="DSUth Exam Bank Logo" style={{ height: 80, width: 80, borderRadius: 8, boxShadow: '0 2px 8px rgba(25,30,50,0.10)' }} />
          </Box>
          <Typography variant="body2" sx={{ color: '#b0bec5', fontWeight: 400, maxWidth: 220 }}>
            Η Τράπεζα Θεμάτων UTH είναι μια ανοιχτή πλατφόρμα διαμοιρασμού αρχείων εξετάσεων και σημειώσεων για φοιτητές του τμήματος Ψηφιακών Συστημάτων.
          </Typography>
        </Box>
        {/* Menu */}
        <Box flex={1} display="flex" flexDirection="column" alignItems="flex-start" justifyContent="center" minWidth={220}>
          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
            Μενού
          </Typography>
          <Stack spacing={0.5} alignItems="flex-start">
            {menuLinks.map(link => (
              <Link key={link.href} href={link.href} underline="hover" color="#e3eafc" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                {link.label}
              </Link>
            ))}
            <Link href="/faq" underline="hover" color="#e3eafc" sx={{ fontSize: '1rem', fontWeight: 500 }}>
              Συχνές Ερωτήσεις
            </Link>
            <Link href="/privacy" underline="hover" color="#e3eafc" sx={{ fontSize: '1rem', fontWeight: 500 }}>
              Πολιτική Απορρήτου
            </Link>
          </Stack>
        </Box>
        {/* Social & Project + Contact */}
        <Box flex={1} display="flex" flexDirection="column" alignItems="flex-start" justifyContent="center" minWidth={220}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
            Επικοινωνία
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <EmailIcon sx={{ color: '#90caf9' }} />
            <Link href="mailto:dsuthexambank@gmail.com" underline="hover" color="#90caf9" sx={{ fontWeight: 500, fontSize: '1rem' }}>
              dsuthexambank@gmail.com
            </Link>
          </Stack>
          <Typography variant="subtitle2" sx={{ color: '#b0bec5', fontWeight: 600, mb: 1, mt: 1 }}>
            Find Our Project In:
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <IconButton href="https://github.com/Vaggelisbob/dsuth-exam-bank" target="_blank" rel="noopener" sx={{ color: '#fff', background: 'rgba(144,202,249,0.08)', '&:hover': { background: 'rgba(144,202,249,0.18)' } }}>
              <GitHubIcon />
            </IconButton>
          </Stack>
          <Typography variant="body2" color="#b0bec5" sx={{ fontWeight: 400, mt: 1 }}>
            Open Source στο GitHub
          </Typography>
        </Box>
      </Stack>
    </Box>
    <Divider sx={{ my: 0, borderColor: 'rgba(255,255,255,0.10)' }} />
    <Box sx={{ py: 2, px: 2, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
        <Typography variant="body2" color="#b0bec5" sx={{ fontWeight: 400 }}>
          © {new Date().getFullYear()} Τράπεζα Θεμάτων UTH
        </Typography>
        <Typography variant="body2" color="#b0bec5" sx={{ fontWeight: 400 }}>
          | Developed by <Link href="https://github.com/Vaggelisbob/dsuth-exam-bank" target="_blank" rel="noopener" underline="hover" color="#90caf9">Vaggelis Mpomponis</Link>
        </Typography>
      </Stack>
    </Box>
  </Box>
);

export default Footer; 