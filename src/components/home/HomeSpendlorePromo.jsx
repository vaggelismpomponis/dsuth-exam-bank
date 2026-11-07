import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import { Wallet, ExternalLink, TrendingUp, ShieldCheck, Smartphone, Users } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: <Wallet size={16} />, title: 'Καταγραφή Εξόδων & Εσόδων', desc: 'Κατηγοριοποίηση και πλήρης έλεγχος καθημερινών συναλλαγών.' },
  { icon: <TrendingUp size={16} />, title: 'Μηνιαίοι Προϋπολογισμοί', desc: 'Όρια ανά κατηγορία και παρακολούθηση αποταμιεύσεων.' },
  { icon: <Smartphone size={16} />, title: 'Web & Mobile PWA', desc: 'Άμεση πρόσβαση από υπολογιστή και κινητό χωρίς εγκατάσταση.' },
];

export const HomeSpendlorePromo = () => {
  return (
    <Box component="section" aria-labelledby="spendlore-promo-heading" sx={{ py: { xs: 5, sm: 7, md: 8 }, bgcolor: 'background.default' }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4.5, md: 5 },
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          {/* Overline & Header */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'primary.main' }}>
                ΦΟΙΤΗΤΙΚΗ ΖΩΗ & ΟΙΚΟΝΟΜΙΚΑ
              </Typography>
              <Box component="span" sx={{ fontSize: '0.65rem', fontWeight: 800, px: 0.8, py: 0.15, borderRadius: '4px', border: '1px solid', borderColor: 'divider', color: 'text.secondary', lineHeight: 1.2 }}>
                BETA
              </Box>
            </Box>

            <Typography id="spendlore-promo-heading" variant="h2" sx={{ fontSize: { xs: '1.35rem', sm: '1.75rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', mb: 1.5 }}>
              Οργανώστε τα έξοδά σας με το Spendlore
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.65, fontSize: '0.95rem', maxWidth: 720 }}>
              Μια σύγχρονη εφαρμογή διαχείρισης προσωπικών οικονομικών σχεδιασμένη για φοιτητές και νέους, για εύκολο έλεγχο εξόδων, μηνιαίους προϋπολογισμούς και αποταμίευση.
            </Typography>
          </Box>

          {/* Feature Highlights Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: { xs: 2, sm: 2.5, md: 3 }, my: { xs: 3, sm: 3.5 } }}>
            {HIGHLIGHTS.map((item) => (
              <Box key={item.title} sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75, color: 'primary.main' }}>
                  {item.icon}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>{item.title}</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8125rem', lineHeight: 1.5 }}>{item.desc}</Typography>
              </Box>
            ))}
          </Box>

          {/* Action Row */}
          <Box sx={{ pt: 2.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                Ανοιχτή Beta έκδοση • Δωρεάν πρόσβαση στο <strong>app.spendlore.gr</strong>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1.5 }}>
              <Button
                component="a"
                href="https://groups.google.com/g/spendlore-beta-testers"
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                size="medium"
                startIcon={<Users size={16} />}
                endIcon={<ExternalLink size={14} />}
                sx={{ minHeight: 42, px: 2.5, borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', textTransform: 'none', whiteSpace: 'nowrap' }}
              >
                Γίνε Tester (Android)
              </Button>

              <Button
                component="a"
                href="https://app.spendlore.gr/"
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                size="medium"
                startIcon={<Wallet size={17} />}
                endIcon={<ExternalLink size={15} />}
                sx={{ minHeight: 42, px: 3, borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem', textTransform: 'none', whiteSpace: 'nowrap' }}
              >
                Δοκιμάστε το Spendlore
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
