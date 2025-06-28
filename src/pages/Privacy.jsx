import React from 'react';
import { Container, Typography, Box } from '@mui/material';

const Privacy = () => (
  <Container maxWidth="md" sx={{ py: 8 }}>
    <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 4, color: '#1976d2' }}>
      Πολιτική Απορρήτου
    </Typography>
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        1. Συλλογή Δεδομένων
      </Typography>
      <Typography color="text.secondary">
        Συλλέγουμε μόνο τα απαραίτητα προσωπικά δεδομένα για τη λειτουργία της πλατφόρμας, όπως email, όνομα χρήστη και στοιχεία σύνδεσης. Δεν συλλέγουμε ευαίσθητα προσωπικά δεδομένα.
      </Typography>
    </Box>
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        2. Χρήση Δεδομένων
      </Typography>
      <Typography color="text.secondary">
        Τα δεδομένα χρησιμοποιούνται αποκλειστικά για την παροχή των υπηρεσιών της πλατφόρμας, την επικοινωνία με τους χρήστες και τη βελτίωση της εμπειρίας χρήσης. Δεν κοινοποιούνται σε τρίτους.
      </Typography>
    </Box>
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        3. Ασφάλεια Δεδομένων
      </Typography>
      <Typography color="text.secondary">
        Λαμβάνουμε όλα τα απαραίτητα τεχνικά και οργανωτικά μέτρα για την προστασία των δεδομένων σας από μη εξουσιοδοτημένη πρόσβαση ή διαρροή.
      </Typography>
    </Box>
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        4. Δικαιώματα Χρηστών
      </Typography>
      <Typography color="text.secondary">
        Έχετε το δικαίωμα πρόσβασης, διόρθωσης ή διαγραφής των προσωπικών σας δεδομένων. Για οποιοδήποτε αίτημα, επικοινωνήστε μαζί μας μέσω της φόρμας επικοινωνίας.
      </Typography>
    </Box>
    <Box>
      <Typography variant="body2" color="text.secondary" align="center">
        Τελευταία ενημέρωση: Ιούνιος 2024
      </Typography>
    </Box>
  </Container>
);

export default Privacy; 