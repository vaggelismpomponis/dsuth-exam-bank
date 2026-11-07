import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

/**
 * AppLogo - Unified, professional vector brand mark for DSUth Exam Bank.
 *
 * Combines an architectural academic book crest with an interlocking
 * geometric 'DS' (Digital Systems) monogram and secure exam repository angles.
 */
export const AppLogo = ({
  size = 32,
  showText = false,
  subtitle = false,
  className = '',
  sx = {},
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      className={className}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.25,
        userSelect: 'none',
        ...sx,
      }}
    >
      {/* Precision Vector Emblem */}
      <Box
        component="svg"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          filter: isDark
            ? 'drop-shadow(0 2px 8px rgba(26, 115, 232, 0.35))'
            : 'drop-shadow(0 2px 6px rgba(26, 115, 232, 0.2))',
          transition: 'transform 0.2s ease',
          '&:hover': { transform: 'scale(1.04)' },
        }}
      >
        <defs>
          {/* Main Royal Shield Gradient */}
          <linearGradient id="dsuthLogoGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="60%" stopColor="#1a73e8" />
            <stop offset="100%" stopColor="#0f4bb8" />
          </linearGradient>

          {/* Electric Cyan Accent Gradient */}
          <linearGradient id="dsuthCyanAccent" x1="16" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Subtle Surface Gloss Highlight */}
          <linearGradient id="dsuthGloss" x1="10" y1="6" x2="38" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Squircle Tile with 1px border ring */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="11"
          fill="url(#dsuthLogoGrad)"
        />
        <rect
          x="3.5"
          y="3.5"
          width="41"
          height="41"
          rx="10.5"
          stroke="#ffffff"
          strokeOpacity="0.18"
          strokeWidth="1"
        />

        {/* Micro Gloss Overlay */}
        <path
          d="M4 14C4 8.47715 8.47715 4 14 4H34C39.5228 4 44 8.47715 44 14V20C32 16 16 18 4 23V14Z"
          fill="url(#dsuthGloss)"
        />

        {/* Open Book Wings / Knowledge Vault Foundation */}
        <path
          d="M13 32.5C17.5 30.5 21.5 30.8 24 32.2C26.5 30.8 30.5 30.5 35 32.5V35C30.5 33 26.5 33.3 24 34.7C21.5 33.3 17.5 33 13 35V32.5Z"
          fill="#ffffff"
          fillOpacity="0.45"
        />

        {/* Stylized Interlocking Monogram: 'D' & 'S' Academic Crest */}
        {/* Left 'D' Arch & Digital Node */}
        <path
          d="M15 15C15 14.4477 15.4477 14 16 14H22C25.3137 14 28 16.6863 28 20C28 23.3137 25.3137 26 22 26H16C15.4477 26 15 25.5523 15 25V15ZM18.5 17.5V22.5H21.5C22.8807 22.5 24 21.3807 24 20C24 18.6193 22.8807 17.5 21.5 17.5H18.5Z"
          fill="#ffffff"
        />

        {/* Interlocking 'S' Digital Ribbon in Electric Cyan */}
        <path
          d="M32.5 18.2C31.8 17.5 30.5 17 29 17C26.8 17 25.5 18.2 25.5 19.8C25.5 22.5 34 22 34 27.5C34 30.8 31 32.5 27.5 32.5C24.5 32.5 22.8 31.5 21.8 30.3L23.8 28.5C24.5 29.5 25.8 30.2 27.5 30.2C29.5 30.2 31.2 29.2 31.2 27.6C31.2 25.2 22.8 25.5 22.8 20C22.8 16.5 25.8 14.8 29 14.8C31.2 14.8 33.2 15.6 34.5 16.8L32.5 18.2Z"
          fill="url(#dsuthCyanAccent)"
        />

        {/* Academic Degree Apex Dot / Digital Connection Marker */}
        <circle cx="24" cy="11.5" r="1.75" fill="#ffffff" />
      </Box>

      {/* Optional Wordmark */}
      {showText && (
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1rem', md: '1.05rem' },
              color: 'text.primary',
              letterSpacing: '-0.025em',
              lineHeight: 1.15,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            DSUth
            <Box
              component="span"
              sx={{
                color: 'primary.main',
                ml: 0.5,
                fontWeight: 800,
              }}
            >
              Exam
            </Box>
            <Box
              component="span"
              sx={{
                ml: 0.5,
                fontSize: '0.65rem',
                fontWeight: 700,
                px: 0.6,
                py: 0.15,
                borderRadius: '4px',
                bgcolor: isDark ? 'rgba(26, 115, 232, 0.2)' : 'rgba(26, 115, 232, 0.1)',
                color: 'primary.main',
                border: '1px solid',
                borderColor: isDark ? 'rgba(26, 115, 232, 0.35)' : 'rgba(26, 115, 232, 0.2)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Bank
            </Box>
          </Typography>

          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                lineHeight: 1,
                mt: 0.25,
              }}
            >
              Τμήμα Ψηφιακών Συστημάτων
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default AppLogo;

