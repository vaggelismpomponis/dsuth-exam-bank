import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import { User, Mail, ShieldCheck, Save } from 'lucide-react';

export const PersonalInfoCard = ({
  profile,
  user,
  isAdmin,
  saving,
  error,
  success,
  onChange,
  onSave,
}) => {
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
            <User size={18} />
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
            Προσωπικά Στοιχεία
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, fontSize: '0.84rem' }}>
          Βασικά στοιχεία ταυτοποίησης και ρόλος του λογαριασμού σας.
        </Typography>

        <Stack spacing={2.25}>
          <TextField
            label="Όνομα"
            name="first_name"
            value={profile.first_name || ''}
            onChange={onChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center' }}>
                    <User size={18} />
                  </Box>
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />

          <TextField
            label="Επώνυμο"
            name="last_name"
            value={profile.last_name || ''}
            onChange={onChange}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center' }}>
                    <User size={18} />
                  </Box>
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
          />

          <TextField
            label="Email"
            value={user?.email || ''}
            fullWidth
            InputProps={{
              readOnly: true,
              startAdornment: (
                <InputAdornment position="start">
                  <Box sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center' }}>
                    <Mail size={18} />
                  </Box>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '8px' },
              '& .MuiOutlinedInput-input': { color: 'text.secondary' },
            }}
          />

          {isAdmin ? (
            <TextField
              select
              label="Ρόλος"
              name="role"
              value={profile.role || 'student'}
              onChange={onChange}
              fullWidth
              helperText="Μόνο ο admin μπορεί να αλλάξει τον ρόλο."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center' }}>
                      <ShieldCheck size={18} />
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            >
              <MenuItem value="student">Φοιτητής</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          ) : (
            <TextField
              label="Ρόλος"
              value={profile.role === 'admin' ? 'Admin' : 'Φοιτητής'}
              fullWidth
              InputProps={{
                readOnly: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: 'text.disabled', display: 'flex', alignItems: 'center' }}>
                      <ShieldCheck size={18} />
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                '& .MuiOutlinedInput-input': { color: 'text.secondary' },
              }}
            />
          )}
        </Stack>

        {error && <Alert severity="error" sx={{ mt: 2.5, borderRadius: '8px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 2.5, borderRadius: '8px' }}>{success}</Alert>}
      </Box>

      <Box sx={{ pt: 3, mt: 1 }}>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <Save size={17} />}
          onClick={onSave}
          fullWidth
          disabled={saving}
          sx={{
            py: 1.2,
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.92rem',
          }}
        >
          {saving ? 'Αποθήκευση...' : 'Αποθήκευση Στοιχείων'}
        </Button>
      </Box>
    </Paper>
  );
};
