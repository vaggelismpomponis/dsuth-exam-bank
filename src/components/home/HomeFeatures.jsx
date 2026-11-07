import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import { BookOpen, Upload, MessageSquare, Heart, HelpCircle, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FEATURES = [
  {
    icon: <BookOpen size={22} />,
    title: 'Μαθήματα',
    desc: 'Εξερευνήστε όλα τα μαθήματα οργανωμένα ανά εξάμηνο σπουδών.',
    href: '/courses',
  },
  {
    icon: <Upload size={22} />,
    title: 'Ανέβασμα Αρχείων',
    desc: 'Προσθέστε θέματα εξετάσεων και σημειώσεις για να βοηθήσετε τους συμφοιτητές σας.',
    href: '/upload',
  },
  {
    icon: <MessageSquare size={22} />,
    title: 'Αιτήματα Υλικού',
    desc: 'Ζητήστε αρχεία ή παλαιότερα θέματα που δεν υπάρχουν ακόμα στην πλατφόρμα.',
    href: '/requests',
  },
  {
    icon: <Heart size={22} />,
    title: 'Αγαπημένα',
    desc: 'Αποθηκεύστε τα τρέχοντα μαθήματά σας για άμεση πρόσβαση με ένα κλικ.',
    href: '/favorites',
  },
  {
    icon: <HelpCircle size={22} />,
    title: 'Συχνές Ερωτήσεις',
    desc: 'Βρείτε άμεσες απαντήσεις για τη λειτουργία και τους κανόνες της πλατφόρμας.',
    href: '/contact#faq',
  },
  {
    icon: <Mail size={22} />,
    title: 'Επικοινωνία',
    desc: 'Στείλτε παρατηρήσεις, προτάσεις βελτίωσης ή αναφέρετε τεχνικά ζητήματα.',
    href: '/contact',
  },
];

export const HomeFeatures = () => {
  const navigate = useNavigate();

  return (
    <Box
      component="section"
      aria-labelledby="features-heading"
      sx={{ py: { xs: 6, sm: 8, md: 10 }, bgcolor: 'background.default' }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 640, mb: { xs: 4, md: 5 } }}>
          <Typography
            component="span"
            sx={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'primary.main',
              mb: 1,
            }}
          >
            ΥΠΗΡΕΣΙΕΣ & ΔΥΝΑΤΟΤΗΤΕΣ
          </Typography>
          <Typography
            id="features-heading"
            variant="h2"
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.875rem' },
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.02em',
              mb: 1,
            }}
          >
            Όλα τα εργαλεία σε ένα σημείο
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Οργανωμένη πρόσβαση σε ακαδημαϊκό υλικό, εργαλεία αναζήτησης και δυνατότητες κοινότητας.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2.5,
          }}
        >
          {FEATURES.map((feature) => (
            <Paper
              key={feature.title}
              component="article"
              onClick={() => navigate(feature.href)}
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease, background-color 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 2 }}>
                {feature.icon}
              </Box>
              <Typography
                component="h3"
                variant="subtitle1"
                sx={{ fontWeight: 700, color: 'text.primary', mb: 0.75, fontSize: '1rem' }}
              >
                {feature.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
                {feature.desc}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

