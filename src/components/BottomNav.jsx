import React from 'react';
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { Home, BookOpen, Plus, Heart, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Αρχική', icon: Home, path: '/' },
  { label: 'Μαθήματα', icon: BookOpen, path: '/courses' },
  { label: null, icon: null, path: null }, // FAB spacer
  { label: 'Αγαπημένα', icon: Heart, path: '/favorites' },
  { label: 'Αιτήματα', icon: MessageSquare, path: '/requests' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const isActive = (path) => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      component="nav"
      aria-label="Κινητή πλοήγηση"
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        bgcolor: isDark ? 'rgba(18, 18, 20, 0.94)' : 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <Box
        sx={{
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          px: 1,
          position: 'relative',
          maxWidth: 480,
          mx: 'auto',
        }}
      >
        {NAV_ITEMS.map((item, idx) => {
          if (!item.path) {
            return (
              <Box key={idx} sx={{ width: 64, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                <Box
                  onClick={() => navigate('/upload')}
                  aria-label="Ανέβασμα θεμάτων"
                  sx={{
                    position: 'absolute',
                    top: -24,
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: 'primary.main',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease',
                    WebkitTapHighlightColor: 'transparent',
                    '&:active': {
                      transform: 'scale(0.94)',
                    },
                  }}
                >
                  <Plus size={22} color="#ffffff" strokeWidth={2.5} />
                </Box>
              </Box>
            );
          }

          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <Box
              key={item.path}
              onClick={() => {
                if (location.pathname === item.path) {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate(item.path);
                }
              }}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                height: '100%',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                position: 'relative',
                gap: 0.3,
                color: active ? 'primary.main' : 'text.secondary',
              }}
            >
              {active && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  }}
                />
              )}

              <Box
                sx={{
                  width: 36,
                  height: 30,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: active ? 'action.selected' : 'transparent',
                  transition: 'all 0.15s ease',
                  '&:active': { transform: 'scale(0.92)' },
                }}
              >
                <Icon size={19} strokeWidth={active ? 2.2 : 1.8} />
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: '0.675rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? 'primary.main' : 'text.secondary',
                  letterSpacing: '0.01em',
                  transition: 'color 0.15s',
                }}
              >
                {item.label}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default BottomNav;
