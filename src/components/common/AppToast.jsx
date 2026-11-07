import React, { forwardRef } from 'react';
import { SnackbarContent, useSnackbar } from 'notistack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, Bell, X } from 'lucide-react';

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle2,
    color: '#10b981',
    accentLight: 'rgba(16, 185, 129, 0.12)',
    accentDark: 'rgba(16, 185, 129, 0.2)',
  },
  error: {
    icon: AlertCircle,
    color: '#ef4444',
    accentLight: 'rgba(239, 68, 68, 0.12)',
    accentDark: 'rgba(239, 68, 68, 0.2)',
  },
  warning: {
    icon: AlertTriangle,
    color: '#f59e0b',
    accentLight: 'rgba(245, 158, 11, 0.12)',
    accentDark: 'rgba(245, 158, 11, 0.2)',
  },
  info: {
    icon: Info,
    color: '#3b82f6',
    accentLight: 'rgba(59, 130, 246, 0.12)',
    accentDark: 'rgba(59, 130, 246, 0.2)',
  },
  default: {
    icon: Bell,
    color: '#6b7280',
    accentLight: 'rgba(107, 114, 128, 0.12)',
    accentDark: 'rgba(107, 114, 128, 0.2)',
  },
};

export const AppToast = forwardRef(function AppToast({ id, message, variant = 'default', ...otherProps }, ref) {
  const { closeSnackbar } = useSnackbar();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const config = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;
  const IconComponent = config.icon;

  return (
    <SnackbarContent ref={ref} role="alert" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minWidth: { xs: 280, sm: 320 },
          maxWidth: { xs: '92vw', sm: 460 },
          px: 1.75,
          py: 1.25,
          borderRadius: '12px',
          bgcolor: isDark ? 'rgba(24, 25, 29, 0.94)' : 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
          boxShadow: isDark
            ? '0 12px 36px -4px rgba(0, 0, 0, 0.7), 0 4px 12px rgba(0, 0, 0, 0.5)'
            : '0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: config.color,
          }}
        >
          <IconComponent size={18} strokeWidth={2.3} />
        </Box>

        <Typography
          sx={{
            flex: 1,
            fontSize: '0.84rem',
            fontWeight: 600,
            color: isDark ? '#f3f4f6' : '#111827',
            lineHeight: 1.35,
            wordBreak: 'break-word',
          }}
        >
          {message}
        </Typography>

        <IconButton
          size="small"
          aria-label="Κλείσιμο ειδοποίησης"
          onClick={() => closeSnackbar(id)}
          sx={{
            color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
            p: 0.5,
            borderRadius: '6px',
            flexShrink: 0,
            '&:hover': {
              color: isDark ? '#ffffff' : '#000000',
              bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
            },
          }}
        >
          <X size={15} />
        </IconButton>
      </Box>
    </SnackbarContent>
  );
});

export default AppToast;

