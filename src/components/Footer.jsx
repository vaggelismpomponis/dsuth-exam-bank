import React from 'react';
import { Box, Typography, Link, Stack, Divider, IconButton, Chip } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LockIcon from '@mui/icons-material/Lock';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HomeIcon from '@mui/icons-material/Home';

const Footer = () => (
  <Box
    component="footer"
    sx={{
      width: '100%',
      mt: 0,
      bgcolor: '#f1f3f4',
      borderTop: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: { xs: 4, md: 6 },
        width: '100%',
        maxWidth: 1100,
        mx: 'auto',
        py: 5,
        px: { xs: 3, sm: 4, md: 5 },
      }}
    >
      {/* Brand */}
      <Box flex={1} display="flex" flexDirection="column" alignItems="flex-start" minWidth={240}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <img src="/dsuth-favicon.png" alt="DSUth Logo" style={{ height: 48, width: 48, borderRadius: 12 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f1f1f', fontSize: '1.1rem' }}>
            DSUth Exam Bank
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 300, lineHeight: 1.7, fontSize: '0.875rem' }}>
          Ανοιχτή πλατφόρμα διαμοιρασμού αρχείων εξετάσεων και σημειώσεων για φοιτητές Ψηφιακών Συστημάτων UTH.
        </Typography>
        <Chip
          label="Open source"
          size="small"
          variant="outlined"
          sx={{ mt: 2, borderColor: '#dadce0', color: 'text.secondary', fontWeight: 500, fontSize: '0.75rem' }}
        />
      </Box>

      {/* Links */}
      <Box flex={1} display="flex" flexDirection="column" alignItems="flex-start" minWidth={160}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#1f1f1f', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Σύνδεσμοι
        </Typography>
        <Stack spacing={1.2} alignItems="flex-start">
          {[
            { href: '/', icon: <HomeIcon sx={{ fontSize: 18 }} />, label: 'Αρχική' },
            { href: '/courses', icon: <MenuBookIcon sx={{ fontSize: 18 }} />, label: 'Μαθήματα' },
            { href: '/upload', icon: <UploadFileIcon sx={{ fontSize: 18 }} />, label: 'Ανέβασμα' },
            { href: '/faq', icon: <QuestionAnswerIcon sx={{ fontSize: 18 }} />, label: 'FAQ' },
            { href: '/privacy', icon: <LockIcon sx={{ fontSize: 18 }} />, label: 'Απόρρητο' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              underline="none"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'text.secondary',
                transition: 'color 0.15s',
                '&:hover': { color: 'primary.main' },
              }}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </Stack>
      </Box>

      {/* Contact */}
      <Box flex={1} display="flex" flexDirection="column" alignItems="flex-start" minWidth={220}>
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#1f1f1f', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Επικοινωνία
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <EmailIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          <Link href="mailto:dsuthexambank@gmail.com" underline="hover" sx={{ fontWeight: 500, fontSize: '0.875rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
            dsuthexambank@gmail.com
          </Link>
        </Stack>
        <Stack direction="row" spacing={0.5} sx={{ mt: 2 }}>
          <IconButton
            size="small"
            component={Link}
            href="https://github.com/vaggelismpomponis/dsuth-exam-bank"
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
            sx={{ color: 'text.secondary', '&:hover': { color: '#1f1f1f', bgcolor: '#e8eaed' } }}
          >
            <GitHubIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            component={Link}
            href="mailto:dsuthexambank@gmail.com"
            aria-label="Email"
            sx={{ color: 'text.secondary', '&:hover': { color: '#1f1f1f', bgcolor: '#e8eaed' } }}
          >
            <EmailIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Box>

    <Divider sx={{ borderColor: '#dadce0' }} />

    <Box sx={{ py: 2.5, px: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: 1100, mx: 'auto' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
        © {new Date().getFullYear()} Τράπεζα Θεμάτων UTH
      </Typography>
    </Box>
  </Box>
);

export default Footer;