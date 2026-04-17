import React from 'react';
import { Box, Typography, Link, Stack, Divider, IconButton, Chip, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailIcon from '@mui/icons-material/Email';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LockIcon from '@mui/icons-material/Lock';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';

const Footer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const navLinks = [
    { href: '/', icon: <HomeIcon sx={{ fontSize: 15 }} />, label: 'Αρχική' },
    { href: '/courses', icon: <MenuBookIcon sx={{ fontSize: 15 }} />, label: 'Μαθήματα' },
    { href: '/upload', icon: <UploadFileIcon sx={{ fontSize: 15 }} />, label: 'Ανέβασμα' },
    { href: '/students', icon: <GroupIcon sx={{ fontSize: 15 }} />, label: 'Φοιτητές' },
    { href: '/contact', icon: <ContactSupportIcon sx={{ fontSize: 15 }} />, label: 'Επικοινωνία' },
  ];

  const legalLinks = [
    { href: '/faq', label: 'FAQ' },
    { href: '/privacy', label: 'Απόρρητο' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        mt: 0,
        bgcolor: isDark ? '#111214' : '#f8f9fa',
        borderTop: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        pb: { xs: 'calc(80px + env(safe-area-inset-bottom, 0px))', md: 0 }
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 3, md: 6 },
          py: { xs: 5, md: 7 },
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
          gap: { xs: 4, md: 8 },
        }}
      >
        {/* Brand Column */}
        <Box>
          {/* Logo + name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box
              component="img"
              src="/favicon.png"
              alt="DS Logo"
              sx={{
                width: 38,
                height: 38,
                borderRadius: 0,
                boxShadow: '0 4px 12px rgba(26,115,232,0.3)',
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: 'text.primary', letterSpacing: '-0.02em' }}>
              DSUth Exam Bank
            </Typography>
          </Box>

          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '0.875rem',
              lineHeight: 1.75,
              maxWidth: 340,
              mb: 2.5,
            }}
          >
            Ανοιχτή πλατφόρμα διαμοιρασμού αρχείων εξετάσεων και σημειώσεων για φοιτητές Ψηφιακών Συστημάτων UTH. Δωρεάν, πάντα.
          </Typography>

          {/* Badges */}
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <Chip
              label="Open Source"
              size="small"
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                color: 'text.secondary',
                borderRadius: '8px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              }}
            />
            <Chip
              label="Ψηφιακά Συστήματα UTH"
              size="small"
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: isDark ? 'rgba(26,115,232,0.12)' : 'rgba(26,115,232,0.07)',
                color: isDark ? '#8ab4f8' : '#1a73e8',
                borderRadius: '8px',
                border: `1px solid ${isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.15)'}`,
              }}
            />
          </Stack>

          {/* Social icons */}
          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
            <IconButton
              component={Link}
              href="https://github.com/vaggelismpomponis/dsuth-exam-bank"
              target="_blank"
              rel="noopener"
              size="small"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                color: 'text.secondary',
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                '&:hover': {
                  color: 'text.primary',
                  bgcolor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                },
              }}
            >
              <GitHubIcon sx={{ fontSize: 17 }} />
            </IconButton>
            <IconButton
              component={Link}
              href="mailto:dsuthexambank@gmail.com"
              size="small"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                color: 'text.secondary',
                bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                '&:hover': {
                  color: '#1a73e8',
                  bgcolor: isDark ? 'rgba(26,115,232,0.12)' : 'rgba(26,115,232,0.07)',
                },
              }}
            >
              <EmailIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Stack>
        </Box>

        {/* Navigation Column */}
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              mb: 2.5,
            }}
          >
            Πλοήγηση
          </Typography>
          <Stack spacing={1.5}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                underline="none"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.2,
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

        {/* Contact Column */}
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              mb: 2.5,
            }}
          >
            Επικοινωνία
          </Typography>

          <Link
            href="mailto:dsuthexambank@gmail.com"
            underline="none"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'text.secondary',
              mb: 2,
              transition: 'color 0.15s',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <EmailIcon sx={{ fontSize: 15 }} />
            dsuthexambank@gmail.com
          </Link>

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              mb: 2,
              mt: 3,
            }}
          >
            Νομικά
          </Typography>
          <Stack spacing={1.5}>
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                underline="none"
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'text.secondary',
                  transition: 'color 0.15s',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        </Box>
      </Box>

      {/* Bottom bar */}
      <Box
        sx={{
          borderTop: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
          px: { xs: 3, md: 6 },
          py: 2.5,
          maxWidth: 1200,
          mx: 'auto',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.disabled', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} Τράπεζα Θεμάτων UTH
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.disabled', fontSize: '0.78rem' }}>
          Ψηφιακά Συστήματα, Πανεπιστήμιο Θεσσαλίας
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;