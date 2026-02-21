import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const faqs = [
  { question: 'Τι είναι η τράπεζα θεμάτων DSUth;', answer: 'Είναι μια πλατφόρμα όπου φοιτητές και απόφοιτοι μπορούν να βρουν, να μοιραστούν και να κατεβάσουν θέματα και αρχεία εξετάσεων του τμήματος Ψηφιακών Συστημάτων.' },
  { question: 'Ποιος μπορεί να ανεβάσει αρχεία;', answer: 'Οποιοσδήποτε έχει λογαριασμό στην πλατφόρμα μπορεί να ανεβάσει αρχεία εξετάσεων ή βοηθητικό υλικό.' },
  { question: 'Είναι δωρεάν η χρήση;', answer: 'Ναι, η χρήση της πλατφόρμας είναι εντελώς δωρεάν για όλους.' },
  { question: 'Πώς προστατεύονται τα δεδομένα μου;', answer: 'Τα προσωπικά δεδομένα διαχειρίζονται με ασφάλεια και δεν κοινοποιούνται σε τρίτους. Δείτε περισσότερα στην πολιτική απορρήτου.' },
  { question: 'Πώς μπορώ να επικοινωνήσω;', answer: 'Μέσω της φόρμας επικοινωνίας ή με email στο κάτω μέρος της σελίδας.' },
  { question: 'Πώς ανεβάζω αρχείο;', answer: 'Αφού συνδεθείτε, πατήστε "Ανέβασε Θέμα" και ακολουθήστε τις οδηγίες.' },
  { question: 'Χρειάζεται λογαριασμός για λήψη;', answer: 'Όχι, μπορείτε να κατεβάσετε αρχεία χωρίς λογαριασμό.' },
  { question: 'Πώς προσθέτω στα αγαπημένα;', answer: 'Πατήστε το εικονίδιο καρδιάς στην καρτέλα του μαθήματος.' },
  { question: 'Ποιος εγκρίνει τα αρχεία;', answer: 'Όλα τα αρχεία ελέγχονται από διαχειριστές πριν δημοσιευθούν.' },
];

const FAQ = () => (
  <Container maxWidth="sm" sx={{ pt: { xs: 2, md: 5 }, pb: { xs: 12, md: 5 } }}>
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: '#e8f0fe', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
        <HelpOutlineIcon sx={{ color: 'primary.main', fontSize: 28 }} />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, color: 'text.primary' }}>
        Συχνές Ερωτήσεις
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Βρείτε γρήγορα απαντήσεις
      </Typography>
    </Box>

    <Box>
      {faqs.map((faq, idx) => (
        <Accordion key={idx} sx={{ mb: 1.5 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.95rem' }}>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary">{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  </Container>
);

export default FAQ;