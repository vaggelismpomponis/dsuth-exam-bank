import React from 'react';
import { Container, Typography, Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: 'Τι είναι η τράπεζα θεμάτων DSUth;?',
    answer: 'Είναι μια πλατφόρμα όπου φοιτητές και απόφοιτοι μπορούν να βρουν, να μοιραστούν και να κατεβάσουν θέματα και αρχεία εξετάσεων του τμήματος Ψηφιακών Συστημάτων.'
  },
  {
    question: 'Ποιος μπορεί να ανεβάσει αρχεία;',
    answer: 'Οποιοσδήποτε έχει λογαριασμό στην πλατφόρμα μπορεί να ανεβάσει αρχεία εξετάσεων ή βοηθητικό υλικό.'
  },
  {
    question: 'Είναι δωρεάν η χρήση της πλατφόρμας;',
    answer: 'Ναι, η χρήση της πλατφόρμας είναι εντελώς δωρεάν για όλους.'
  },
  {
    question: 'Πώς προστατεύονται τα προσωπικά μου δεδομένα;',
    answer: 'Τα προσωπικά δεδομένα διαχειρίζονται με ασφάλεια και δεν κοινοποιούνται σε τρίτους. Μπορείτε να διαβάσετε περισσότερα στην πολιτική απορρήτου.'
  },
  {
    question: 'Πώς μπορώ να επικοινωνήσω με τους διαχειριστές;',
    answer: 'Μπορείτε να επικοινωνήσετε μέσω της φόρμας επικοινωνίας ή με email που θα βρείτε στο κάτω μέρος της σελίδας.'
  },
  {
    question: 'Πώς μπορώ να ανεβάσω ένα αρχείο;',
    answer: 'Αφού συνδεθείτε, πατήστε "Ανέβασε Θέμα" ή μεταβείτε στη σελίδα Ανεβάσματος και ακολουθήστε τις οδηγίες.'
  },
  {
    question: 'Πρέπει να είμαι μέλος για να κατεβάσω αρχεία;',
    answer: 'Όχι, μπορείτε να κατεβάσετε αρχεία χωρίς να έχετε λογαριασμό.'
  },
  {
    question: 'Πώς προσθέτω ένα μάθημα στα αγαπημένα;',
    answer: 'Στην καρτέλα του μαθήματος ή του αρχείου, πατήστε το εικονίδιο της καρδιάς.'
  },
  {
    question: 'Ποιος εγκρίνει τα αρχεία που ανεβάζω;',
    answer: 'Όλα τα αρχεία ελέγχονται από διαχειριστές πριν δημοσιευθούν.'
  },
];

const FAQ = () => (
  <Container maxWidth="md" sx={{ py: 8 }}>
    <Typography variant="h4" align="center" sx={{ fontWeight: 800, mb: 4, color: '#1976d2' }}>
      Συχνές Ερωτήσεις
    </Typography>
    <Box>
      {faqs.map((faq, idx) => (
        <Accordion key={idx} sx={{
          mb: 2,
          borderRadius: 2,
          boxShadow: 1,
          border: 'none',
          outline: 'none',
          '&.Mui-expanded': { border: 'none', outline: 'none' },
          '&.Mui-focused': { border: 'none', outline: 'none' },
          '&:focus': { border: 'none', outline: 'none' },
          '&.Mui-active': { border: 'none', outline: 'none' },
          '&:active': { border: 'none', outline: 'none' },
          '& button:hover': { border: 'none', outline: 'none' },
          '&:hover': { outline: 'none' },
          '& .MuiAccordionSummary-root': { outline: 'none' },
          '& .MuiAccordionSummary-root:focus': { outline: 'none' },
          '& .MuiAccordionSummary-root.Mui-focused': { outline: 'none' },
          '& .MuiAccordionSummary-root:active': { outline: 'none' },
        }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>{faq.question}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography color="text.secondary">{faq.answer}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  </Container>
);

export default FAQ; 