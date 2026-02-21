import React from 'react';
import { Container, Typography, Box, Paper, Stack, Divider } from '@mui/material';
import GppGoodIcon from '@mui/icons-material/GppGood';

const sections = [
  { title: '1. Συλλογή Δεδομένων', text: 'Συλλέγουμε μόνο τα απαραίτητα προσωπικά δεδομένα για τη λειτουργία της πλατφόρμας, όπως email, όνομα χρήστη και στοιχεία σύνδεσης. Δεν συλλέγουμε ευαίσθητα προσωπικά δεδομένα.' },
  { title: '2. Χρήση Δεδομένων', text: 'Τα δεδομένα χρησιμοποιούνται αποκλειστικά για την παροχή των υπηρεσιών της πλατφόρμας, την επικοινωνία με τους χρήστες και τη βελτίωση της εμπειρίας χρήσης. Δεν κοινοποιούνται σε τρίτους.' },
  { title: '3. Ασφάλεια Δεδομένων', text: 'Λαμβάνουμε όλα τα απαραίτητα τεχνικά και οργανωτικά μέτρα για την προστασία των δεδομένων σας από μη εξουσιοδοτημένη πρόσβαση ή διαρροή.' },
  { title: '4. Δικαιώματα Χρηστών', text: 'Έχετε το δικαίωμα πρόσβασης, διόρθωσης ή διαγραφής των προσωπικών σας δεδομένων. Για οποιοδήποτε αίτημα, επικοινωνήστε μαζί μας μέσω της φόρμας επικοινωνίας.' },
];

const Privacy = () => (
  <Container maxWidth="sm" sx={{ pt: { xs: 2, md: 5 }, pb: { xs: 12, md: 5 } }}>
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: '#e8f0fe', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
        <GppGoodIcon sx={{ color: 'primary.main', fontSize: 28 }} />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
        Πολιτική Απορρήτου
      </Typography>
    </Box>

    <Paper sx={{ p: { xs: 3, sm: 4 }, border: '1px solid', borderColor: 'divider' }}>
      <Stack spacing={3}>
        {sections.map((s, idx) => (
          <Box key={idx}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>{s.title}</Typography>
            <Typography variant="body2" color="text.secondary">{s.text}</Typography>
            {idx < sections.length - 1 && <Divider sx={{ mt: 3 }} />}
          </Box>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
        Τελευταία ενημέρωση: Ιούνιος 2024
      </Typography>
    </Paper>
  </Container>
);

export default Privacy;