import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { question: 'Τι είναι η τράπεζα θεμάτων DSUth;', answer: 'Είναι μια κοινοτική πλατφόρμα όπου φοιτητές και απόφοιτοι του Τμήματος Ψηφιακών Συστημάτων μπορούν να βρίσκουν, να μοιράζονται και να κατεβάζουν θέματα εξετάσεων και εκπαιδευτικό υλικό.' },
  { question: 'Ποιος μπορεί να ανεβάσει αρχεία;', answer: 'Οποιοσδήποτε συνδεδεμένος χρήστης μπορεί να συνεισφέρει θέματα εξετάσεων ή βοηθητικές σημειώσεις.' },
  { question: 'Είναι δωρεάν η πρόσβαση;', answer: 'Ναι, η πλατφόρμα είναι εντελώς δωρεάν και ανοιχτή για όλους τους φοιτητές.' },
  { question: 'Πώς προστατεύονται τα δεδομένα μου;', answer: 'Συλλέγουμε μόνο τα απολύτως απαραίτητα στοιχεία για την ταυτοποίηση και λειτουργία του λογαριασμού σας. Δεν κοινοποιούνται ποτέ δεδομένα σε τρίτους.' },
  { question: 'Πώς μπορώ να επικοινωνήσω με τους διαχειριστές;', answer: 'Μπορείτε να χρησιμοποιήσετε την παραπάνω φόρμα επικοινωνίας ή να στείλετε email στο dsuthexambank@gmail.com.' },
  { question: 'Πώς ανεβάζω ένα νέο αρχείο;', answer: 'Συνδεθείτε στον λογαριασμό σας, μεταβείτε στη σελίδα "Ανέβασμα" και επιλέξτε εξάμηνο, μάθημα, έτος και εξεταστική περίοδο.' },
  { question: 'Χρειάζεται εγγραφή για να κατεβάσω αρχεία;', answer: 'Όχι, η προβολή και η λήψη θεμάτων είναι ελεύθερη χωρίς υποχρέωση σύνδεσης.' },
  { question: 'Ποιος εγκρίνει τα αρχεία που υποβάλλονται;', answer: 'Όλα τα αρχεία ελέγχονται προσεκτικά από την ομάδα διαχειριστών πριν γίνουν δημόσια διαθέσιμα, εξασφαλίζοντας την ποιότητα και την εγκυρότητα του περιεχομένου.' },
];

export const ContactFaq = () => {
  return (
    <Box id="faq" component="section" sx={{ pt: { xs: 6, md: 8 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          component="span"
          sx={{
            display: 'block',
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'primary.main',
            mb: 0.75,
          }}
        >
          Συχνές Ερωτήσεις
        </Typography>

        <Typography variant="h2" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 1 }}>
          Συχνές Ερωτήσεις (FAQ)
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Βρείτε άμεσες απαντήσεις για τη λειτουργία, το ανέβασμα και τη διαχείριση αρχείων.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {FAQS.map((faq, idx) => (
          <Accordion
            key={idx}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px !important',
              bgcolor: 'background.paper',
            }}
          >
            <AccordionSummary expandIcon={<ChevronDown size={18} />}>
              <Typography sx={{ fontWeight: 600, fontSize: '0.925rem' }}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  );
};

