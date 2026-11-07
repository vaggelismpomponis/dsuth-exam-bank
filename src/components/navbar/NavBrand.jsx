import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppLogo } from '../common/AppLogo';

export const NavBrand = ({ isAdminRoute, onAdminToggle, showAdminToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBrandClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {isAdminRoute && showAdminToggle && onAdminToggle && (
        <IconButton
          edge="start"
          onClick={onAdminToggle}
          aria-label="Εναλλαγή sidebar"
          sx={{ color: 'text.primary', mr: 0.5, borderRadius: '8px' }}
        >
          <Menu size={20} />
        </IconButton>
      )}

      <Box
        onClick={handleBrandClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <AppLogo size={32} showText={true} />
      </Box>
    </Box>
  );
};


