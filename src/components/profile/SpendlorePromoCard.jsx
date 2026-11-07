import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Wallet, ExternalLink, CheckCircle2, Users } from 'lucide-react';

const HIGHLIGHTS = [
  'Καταγραφή καθημερινών συναλλαγών και κατηγοριοποίηση εξόδων',
  'Μηνιαίοι προϋπολογισμοί με παρακολούθηση ορίων ανά κατηγορία',
  'Πρόσβαση από παντού μέσω του Web App & PWA για κινητές συσκευές',
];

export const SpendlorePromoCard = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: { xs: 2.5, sm: 3.5 },
      }}
    >
      {/* Category Overline */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          fontSize: '0.7rem',
          mb: 1,
        }}
      >
        ΧΡΗΣΙΜΑ ΕΡΓΑΛΕΙΑ & ΣΥΝΕΡΓΑΤΕΣ
      </Typography>

      {/* Title & Beta Badge */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25, flexWrap: 'wrap' }}>
        <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
          <Wallet size={20} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', sm: '1.125rem' }, color: 'text.primary' }}>
          Spendlore — Διαχείριση Προσωπικών Οικονομικών
        </Typography>
        <Box
          component="span"
          sx={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: 'text.secondary',
            border: '1px solid',
            borderColor: 'divider',
            px: 0.8,
            py: 0.15,
            borderRadius: '4px',
            lineHeight: 1.2,
          }}
        >
          BETA
        </Box>
      </Box>

      {/* Description */}
      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, fontSize: '0.875rem', maxWidth: 800, mb: 2.5 }}>
        Συνδυάστε την ακαδημαϊκή σας οργάνωση με τον αποτελεσματικό έλεγχο των οικονομικών σας.
        Το Spendlore είναι μια σύγχρονη εφαρμογή καταγραφής εξόδων, εσόδων και προϋπολογισμών,
        σχεδιασμένη για φοιτητές και νέους που θέλουν πλήρη εικόνα των χρημάτων τους.
      </Typography>

      {/* Benefits List */}
      <Stack spacing={1.25} sx={{ mb: 3 }}>
        {HIGHLIGHTS.map((item) => (
          <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
            <Box sx={{ color: 'success.main', display: 'flex', alignItems: 'center', mt: 0.25, shrink: 0 }}>
              <CheckCircle2 size={16} />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.85rem', fontWeight: 500 }}>
              {item}
            </Typography>
          </Box>
        ))}
      </Stack>

      {/* Footer / CTA row */}
      <Box
        sx={{
          pt: 2.25,
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
          Διαθέσιμο δωρεάν στο <strong>app.spendlore.gr</strong> • Closed Beta στο Google Play
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5 }}>
          <Button
            component="a"
            href="https://groups.google.com/g/spendlore-beta-testers"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            startIcon={<Users size={15} />}
            endIcon={<ExternalLink size={13} />}
            sx={{ borderRadius: '8px', px: 2, py: 0.8, fontWeight: 600, fontSize: '0.8125rem', textTransform: 'none', whiteSpace: 'nowrap' }}
          >
            Γίνε Tester (Android)
          </Button>

          <Button
            component="a"
            href="https://app.spendlore.gr/"
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            size="small"
            startIcon={<Wallet size={16} />}
            endIcon={<ExternalLink size={14} />}
            sx={{ borderRadius: '8px', px: 2.25, py: 0.8, fontWeight: 700, fontSize: '0.825rem', textTransform: 'none', whiteSpace: 'nowrap' }}
          >
            Άνοιγμα Spendlore
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
