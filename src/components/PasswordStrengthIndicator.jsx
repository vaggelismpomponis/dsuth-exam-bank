import React from 'react';
import { Box, Typography, LinearProgress, Stack } from '@mui/material';
import { validatePassword, getPasswordRequirements } from '../utils/passwordValidation';
import { CheckCircle2, XCircle } from 'lucide-react';

const PasswordStrengthIndicator = ({ password, showRequirements = true }) => {
  if (!password) return null;

  const validation = validatePassword(password);
  const requirements = getPasswordRequirements();

  const getStrengthText = (level) => {
    switch (level) {
      case 'weak': return 'Αδύναμος';
      case 'fair': return 'Αρκετός';
      case 'medium': return 'Μέτριος';
      case 'strong': return 'Ισχυρός';
      default: return 'Αδύναμος';
    }
  };

  return (
    <Box sx={{ mt: 1, width: '100%' }}>
      {/* Strength Bar */}
      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#666' }}>
            Ισχύς κωδικού:
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: validation.strengthColor }}>
            {getStrengthText(validation.strengthLevel)}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={validation.percentage}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: '#e0e0e0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: validation.strengthColor,
              borderRadius: 4,
            }
          }}
        />
      </Box>

      {/* Requirements Checklist */}
      {showRequirements && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#666', mb: 1 }}>
            Απαιτήσεις κωδικού:
          </Typography>
          <Stack spacing={0.5}>
            {requirements.map((req) => {
              const isMet = validation.checks[req.key];
              return (
                <Box
                  key={req.key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    opacity: isMet ? 1 : 0.7,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  {isMet ? (
                    <CheckCircle2 size={15} color="#4caf50" style={{ flexShrink: 0 }} />
                  ) : (
                    <XCircle size={15} color="#f44336" style={{ flexShrink: 0 }} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: isMet ? '#4caf50' : '#666',
                      fontWeight: isMet ? 600 : 400,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {req.label}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default PasswordStrengthIndicator; 