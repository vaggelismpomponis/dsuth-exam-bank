import React from 'react';
import { Box, Typography, Link, Stack, Divider, IconButton, Chip } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LockIcon from '@mui/icons-material/Lock';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HomeIcon from '@mui/icons-material/Home';

const menuLinks = [
  { label: 'Αρχική', href: '/' },
  { label: 'Μαθήματα', href: '/courses' },
  { label: 'Ανέβασμα Αρχείων', href: '/upload' },
  { label: 'Προφίλ', href: '/profile' },
];

const Footer = () => (
  <Box component="footer" sx={{ width: '100%', mt: 0, background: 'linear-gradient(120deg, #1f2430 0%, #2b3242 100%)', color: '#fff', borderTop: 'none', boxShadow: '0 -2px 16px 0 rgba(25, 30, 50, 0.10)' }}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'flex-start' },
        justifyContent: 'space-between',
        gap: { xs: 4, md: 6 },
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        py: 5,
        px: { xs: 2, sm: 4, md: 6 },
      }}
    >
      {/* Contact/Logo/Description */}
      <Box flex={1} display="flex" flexDirection="column" alignItems="flex-start" justifyContent="flex-start" minWidth={280}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
          <img src="/dsuth-favicon.png" alt="DSUth Exam Bank Logo" style={{ height: 80, width: 80, borderRadius: 8, boxShadow: '0 2px 8px rgba(25,30,50,0.10)' }} />
        </Box>
        <Typography variant="body2" sx={{ color: '#b0bec5', fontWeight: 400, maxWidth: 320, lineHeight: 1.7 }}>
          Η Τράπεζα Θεμάτων UTH είναι μια ανοιχτή πλατφόρμα διαμοιρασμού αρχείων εξετάσεων και σημειώσεων για φοιτητές του τμήματος Ψηφιακών Συστημάτων.
        </Typography>
        {/* social icons moved to Contact section */}
      </Box>
      {/* Menu */}
      <Box flex={1} display="flex" flexDirection="column" alignItems="flex-start" justifyContent="flex-start" minWidth={200}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
          Μενού
        </Typography>
        <Stack spacing={1.2} alignItems="flex-start">
          <Link href="/" underline="hover" color="#e3eafc" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', fontWeight: 500, '&:hover': { color: '#90caf9' } }}>
            <HomeIcon fontSize="small" /> Αρχική
          </Link>
          <Link href="/courses" underline="hover" color="#e3eafc" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', fontWeight: 500, '&:hover': { color: '#90caf9' } }}>
            <MenuBookIcon fontSize="small" /> Μαθήματα
          </Link>
          <Link href="/upload" underline="hover" color="#e3eafc" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', fontWeight: 500, '&:hover': { color: '#90caf9' } }}>
            <UploadFileIcon fontSize="small" /> Ανέβασμα Αρχείων
          </Link>
          <Link href="/faq" underline="hover" color="#e3eafc" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', fontWeight: 500, '&:hover': { color: '#90caf9' } }}>
            <QuestionAnswerIcon fontSize="small" /> Συχνές Ερωτήσεις
          </Link>
          <Link href="/privacy" underline="hover" color="#e3eafc" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1rem', fontWeight: 500, '&:hover': { color: '#90caf9' } }}>
            <LockIcon fontSize="small" /> Πολιτική Απορρήτου
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
        {/* Social icons under Contact */}
        <Typography variant="h6" sx={{ mt:2, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>
          Socials
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <IconButton size="small" color="inherit" component={Link} href="https://github.com/vaggelismpomponis/dsuth-exam-bank" target="_blank" rel="noopener" aria-label="GitHub" sx={{ color: '#90caf9' }}>
            <GitHubIcon />
          </IconButton>
          <IconButton size="small" color="inherit" component={Link} href="mailto:dsuthexambank@gmail.com" aria-label="Email" sx={{ color: '#90caf9' }}>
            <EmailIcon />
          </IconButton>
        </Stack>
        <Chip label="Open source" size="small" sx={{ mt: 2, backgroundColor: 'rgba(144,202,249,0.15)', color: '#90caf9', borderColor: '#90caf9' }} variant="outlined" />
      </Box>
    </Box>
    <Divider sx={{ my: 0, borderColor: 'rgba(255,255,255,0.10)' }} />
    <Box sx={{ py: 3, px: 2, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="body2" color="#b0bec5" sx={{ fontWeight: 400, fontSize: '0.95rem' }}>
        © {new Date().getFullYear()} Τράπεζα Θεμάτων UTH
      </Typography>
      <span />
    </Box>
  </Box>
);

export default Footer; 