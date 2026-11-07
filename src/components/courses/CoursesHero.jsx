import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { Search } from 'lucide-react';

export const CoursesHero = ({ coursesCount, filesCount, search, onSearchChange }) => {
  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        bgcolor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pt: { xs: 4, sm: 6, md: 7 },
        pb: { xs: 4, sm: 5, md: 6 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
        <Box sx={{ maxWidth: 760 }}>
          <Typography
            component="span"
            sx={{
              display: 'block',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'primary.main',
              mb: 1.5,
            }}
          >
            ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΙΑΣ • ΠΡΟΓΡΑΜΜΑ ΣΠΟΥΔΩΝ
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '1.875rem', sm: '2.5rem', md: '2.875rem' },
              fontWeight: 800,
              color: 'text.primary',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              mb: 1.5,
            }}
          >
            Μαθήματα & Υλικό
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              color: 'text.secondary',
              lineHeight: 1.6,
              mb: 3,
            }}
          >
            Εξερευνήστε όλα τα μαθήματα του Τμήματος Ψηφιακών Συστημάτων οργανωμένα ανά εξάμηνο.
            {coursesCount > 0 && ` Διαθέσιμα ${coursesCount} μαθήματα και ${filesCount} αρχεία.`}
          </Typography>

          <TextField
            fullWidth
            placeholder="Αναζήτηση μαθήματος (π.χ. Βάσεις Δεδομένων, Δίκτυα)..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      <Search size={18} />
                    </Box>
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              maxWidth: 580,
              bgcolor: 'background.paper',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                minHeight: 46,
              },
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

