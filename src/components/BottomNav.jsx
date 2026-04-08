import React from 'react';
import { Box, useTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Αρχική', icon: HomeIcon, path: '/' },
  { label: 'Μαθήματα', icon: SearchIcon, path: '/courses' },
  { label: null, icon: null, path: null }, // FAB spacer
  { label: 'Αγαπημένα', icon: FavoriteIcon, path: '/favorites' },
  { label: 'Φοιτητές', icon: GroupIcon, path: '/students' },
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
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        bgcolor: isDark ? 'rgba(18,18,20,0.92)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <Box
        sx={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          px: 1,
          position: 'relative',
          maxWidth: 480,
          mx: 'auto',
        }}
      >
        {navItems.map((item, idx) => {
          if (!item.path) {
            return (
              <Box key={idx} sx={{ width: 64, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                {/* FAB */}
                <Box
                  onClick={() => navigate('/upload')}
                  sx={{
                    position: 'absolute',
                    top: -28,
                    width: 52,
                    height: 52,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #1a73e8, #0052cc)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(26,115,232,0.4)',
                    transition: 'all 0.15s ease',
                    WebkitTapHighlightColor: 'transparent',
                    '&:active': {
                      transform: 'scale(0.94)',
                      boxShadow: '0 3px 12px rgba(26,115,232,0.35)',
                    },
                  }}
                >
                  <AddIcon sx={{ color: '#fff', fontSize: 24 }} />
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
                gap: 0.4,
              }}
            >
              {/* Active indicator dot */}
              {active && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
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
                  height: 32,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: active
                    ? isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.1)'
                    : 'transparent',
                  transition: 'all 0.15s ease',
                  '&:active': { transform: 'scale(0.9)' },
                }}
              >
                <Icon
                  sx={{
                    fontSize: 21,
                    color: active ? 'primary.main' : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.38)',
                    transition: 'color 0.15s',
                  }}
                />
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: '0.65rem',
                  fontWeight: active ? 700 : 400,
                  color: active ? 'primary.main' : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.38)',
                  fontFamily: "'Inter', sans-serif",
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
