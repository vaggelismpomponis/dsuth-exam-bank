import React, { useContext } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import {
  SlidersHorizontal,
  Monitor,
  Sun,
  Moon,
  Lock,
  Download,
  Trash2,
  LogOut,
} from 'lucide-react';
import { ColorModeContext } from '../../context/ColorModeContext';

const THEME_OPTIONS = [
  { value: 'system', label: 'Σύστημα', icon: <Monitor size={17} /> },
  { value: 'light', label: 'Φωτεινό', icon: <Sun size={17} /> },
  { value: 'dark', label: 'Σκοτεινό', icon: <Moon size={17} /> },
];

export const OtherSettingsCard = ({
  passwordSuccess,
  onOpenPasswordDialog,
  onExportData,
  onOpenDeleteDialog,
  onLogout,
}) => {
  const { themePreference, setThemePreference } = useContext(ColorModeContext);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        p: { xs: 2.5, sm: 3.5 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
            <SlidersHorizontal size={18} />
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              fontSize: '0.72rem',
            }}
          >
            Άλλες Ρυθμίσεις
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '0.84rem' }}>
          Εμφάνιση εφαρμογής, ασφάλεια και διαχείριση λογαριασμού.
        </Typography>

        {/* ── Theme Selection ── */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              fontSize: '0.7rem',
              mb: 1.25,
            }}
          >
            Θέμα Εφαρμογής
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            {THEME_OPTIONS.map((opt) => {
              const selected = themePreference === opt.value;
              return (
                <Button
                  key={opt.value}
                  onClick={() => setThemePreference(opt.value)}
                  variant="outlined"
                  sx={{
                    py: 1.2,
                    px: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                    borderRadius: '8px',
                    borderColor: selected ? 'primary.main' : 'divider',
                    bgcolor: selected ? 'action.selected' : 'transparent',
                    color: selected ? 'primary.main' : 'text.secondary',
                    fontWeight: selected ? 700 : 500,
                    fontSize: '0.8rem',
                    borderWidth: selected ? '1.5px' : '1px',
                    '&:hover': {
                      borderColor: selected ? 'primary.main' : 'text.secondary',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </Button>
              );
            })}
          </Box>
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* ── Security ── */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              fontSize: '0.7rem',
              mb: 1.25,
            }}
          >
            Ασφάλεια
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Lock size={16} />}
            fullWidth
            onClick={onOpenPasswordDialog}
            sx={{ py: 1.1, borderRadius: '8px', fontWeight: 600, fontSize: '0.88rem' }}
          >
            Αλλαγή Κωδικού Πρόσβασης
          </Button>
          {passwordSuccess && <Alert severity="success" sx={{ mt: 1.5, borderRadius: '8px' }}>{passwordSuccess}</Alert>}
        </Box>

        <Divider sx={{ my: 2.5 }} />

        {/* ── GDPR ── */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              fontSize: '0.7rem',
              mb: 1.25,
            }}
          >
            Δικαιώματα Χρήστη (GDPR)
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
            <Button
              variant="outlined"
              startIcon={<Download size={16} />}
              fullWidth
              onClick={onExportData}
              sx={{ py: 1, borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem' }}
            >
              Εξαγωγή Δεδομένων
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={16} />}
              fullWidth
              onClick={onOpenDeleteDialog}
              sx={{ py: 1, borderRadius: '8px', fontWeight: 600, fontSize: '0.82rem' }}
            >
              Διαγραφή Λογαριασμού
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* ── Sign Out ── */}
      <Box sx={{ pt: 3, mt: 1 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogOut size={16} />}
          fullWidth
          onClick={onLogout}
          sx={{
            py: 1.2,
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.92rem',
          }}
        >
          Αποσύνδεση
        </Button>
      </Box>
    </Paper>
  );
};
