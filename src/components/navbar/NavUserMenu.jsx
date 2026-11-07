import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { User, LayoutDashboard, LogOut, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const NavUserMenu = ({ user, isAdmin, onLogout, isMobile }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const avatarLetter = user?.email?.[0]?.toUpperCase() || 'U';
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Χρήστης';

  if (!user) {
    if (isMobile) {
      return (
        <IconButton
          component={Link}
          to="/login"
          size="small"
          aria-label="Σύνδεση"
          sx={{ color: 'text.secondary', width: 36, height: 36, borderRadius: '8px' }}
        >
          <LogIn size={18} />
        </IconButton>
      );
    }
    return (
      <Button
        component={Link}
        to="/login"
        variant="contained"
        size="small"
        sx={{
          px: { md: 1.5, lg: 2 },
          py: 0.75,
          fontSize: { md: '0.8125rem', lg: '0.85rem' },
          fontWeight: 700,
          borderRadius: '8px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Είσοδος
      </Button>
    );
  }

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
        aria-label="Μενού χρήστη"
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{ p: 0.5, borderRadius: '8px' }}
      >
        <Avatar
          src={avatarUrl}
          alt={displayName}
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 700,
          }}
        >
          {!avatarUrl && avatarLetter}
        </Avatar>
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            minWidth: 200,
            p: 1,
            mt: 1,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        }}
      >
        <Box sx={{ px: 1.5, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
            {displayName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
            {user.email}
          </Typography>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            navigate('/profile');
            setAnchorEl(null);
          }}
          sx={{ borderRadius: '8px', py: 1, px: 1.5, gap: 1.5 }}
        >
          <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
            <User size={16} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Προφίλ</Typography>
        </MenuItem>

        {isAdmin && (
          <MenuItem
            onClick={() => {
              navigate('/admin');
              setAnchorEl(null);
            }}
            sx={{ borderRadius: '8px', py: 1, px: 1.5, gap: 1.5 }}
          >
            <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
              <LayoutDashboard size={16} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem' }}>Admin Dashboard</Typography>
          </MenuItem>
        )}

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onLogout();
          }}
          sx={{
            borderRadius: '8px',
            py: 1,
            px: 1.5,
            gap: 1.5,
            color: 'error.main',
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Box sx={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>
            <LogOut size={16} />
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'inherit' }}>
            Αποσύνδεση
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
};
