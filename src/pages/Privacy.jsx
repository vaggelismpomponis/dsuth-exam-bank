import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

const SECTIONS = [
  { title: '1. Συλλογή Δεδομένων', text: 'Συλλέγουμε μόνο τα απαραίτητα προσωπικά δεδομένα για τη λειτουργία της πλατφόρμας, όπως διεύθυνση email, όνομα χρήστη και στοιχεία ταυτοποίησης. Δεν συλλέγουμε ευαίσθητα προσωπικά δεδομένα.' },
  { title: '2. Χρήση Δεδομένων', text: 'Τα δεδομένα χρησιμοποιούνται αποκλειστικά για την παροχή των υπηρεσιών της πλατφόρμας, τη διαχείριση λογαριασμού και τη βελτίωση της εμπειρίας μελέτης. Δεν κοινοποιούνται ποτέ σε τρίτους.' },
  { title: '3. Ασφάλεια Δεδομένων', text: 'Εφαρμόζουμε σύγχρονα τεχνικά και οργανωτικά μέτρα προστασίας (κρυπτογράφηση, ασφαλή πρωτόκολλα και αυστηρούς κανόνες RLS στη βάση δεδομένων) για την αποτροπή μη εξουσιοδοτημένης πρόσβασης.' },
  { title: '4. Δικαιώματα Χρηστών', text: 'Έχετε το δικαίωμα πρόσβασης, τροποποίησης ή πλήρους διαγραφής των στοιχείων του λογαριασμού σας οποιαδήποτε στιγμή μέσα από τις ρυθμίσεις προφίλ ή επικοινωνώντας μαζί μας.' },
];

const Privacy = () => (
  <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default', pb: { xs: 10, md: 8 } }}>
    <Box component="header" sx={{ width: '100%', bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider', pt: { xs: 4, sm: 6 }, pb: { xs: 4, sm: 5 } }}>
      <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 4 } }}>
        <Typography component="span" sx={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'primary.main', mb: 1.5 }}>
          ΑΣΦΑΛΕΙΑ & ΠΡΟΣΤΑΣΙΑ ΔΕΔΟΜΕΝΩΝ
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: '1.875rem', sm: '2.5rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 1 }}>
          Πολιτική Απορρήτου
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          Πληροφορίες σχετικά με τη συλλογή, χρήση και ασφάλεια των δεδομένων σας στην πλατφόρμα.
        </Typography>
      </Container>
    </Box>

    <Container maxWidth="md" sx={{ px: { xs: 2.5, sm: 4 }, pt: 4 }}>
      <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
        <Stack spacing={3}>
          {SECTIONS.map((s, idx) => (
            <Box key={idx}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>{s.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{s.text}</Typography>
              {idx < SECTIONS.length - 1 && <Divider sx={{ mt: 3 }} />}
            </Box>
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
          Τελευταία ενημέρωση: Νοέμβριος 2026
        </Typography>
      </Paper>
    </Container>
  </Box>
);

export default Privacy;
