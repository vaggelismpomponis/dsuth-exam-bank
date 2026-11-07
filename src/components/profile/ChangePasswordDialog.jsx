import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import { Lock, X, Eye, EyeOff } from 'lucide-react';
import { validatePassword } from '../../utils/passwordValidation';
import PasswordStrengthIndicator from '../PasswordStrengthIndicator';

export const ChangePasswordDialog = ({
  open,
  onClose,
  onSubmit,
  error,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isValid = validatePassword(password).isValid;

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    onClose();
  };

  const handleSave = () => {
    if (!isValid) return;
    onSubmit(password);
    setPassword('');
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '16px', p: 0.5 } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
            <Lock size={18} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Αλλαγή Κωδικού</Typography>
        </Box>
        <IconButton onClick={handleClose} size="small" aria-label="Κλείσιμο">
          <X size={16} />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2.5, fontSize: '0.9rem' }}>
          Εισάγετε τον νέο σας κωδικό πρόσβασης παρακάτω.
        </DialogContentText>
        <Stack spacing={2}>
          <TextField
            label="Νέος κωδικός"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small" aria-label="Εναλλαγή ορατότητας">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <PasswordStrengthIndicator password={password} />
          {error && <Alert severity="error" sx={{ borderRadius: '8px' }}>{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
        <Button onClick={handleClose} color="inherit" sx={{ borderRadius: '8px' }}>
          Ακύρωση
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!isValid}
          sx={{ borderRadius: '8px', fontWeight: 700 }}
        >
          Αποθήκευση
        </Button>
      </DialogActions>
    </Dialog>
  );
};
