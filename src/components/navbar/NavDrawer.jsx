import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import { X, LogOut, LayoutDashboard, User, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppLogo } from '../common/AppLogo';

export const NavDrawer = ({ open, onClose, items, user, isAdmin, onLogout }) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const avatarLetter = user?.email?.[0]?.toUpperCase() || 'U';
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Χρήστης';

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ disableScrollLock: true }}
      PaperProps={{
        sx: {
          width: { xs: 280, sm: 320 },
          borderRadius: 0,
          bgcolor: 'background.paper',
          borderLeft: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 'env(safe-area-inset-top, 0px)' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AppLogo size={28} showText={true} />
          </Box>
          <IconButton onClick={onClose} size="small" aria-label="Κλείσιμο" sx={{ borderRadius: '8px' }}>
            <X size={20} />
          </IconButton>
        </Box>

        {/* User Card with Dropdown */}
        {user ? (
          <Box sx={{ mx: 2, mt: 2 }}>
            <Box
              onClick={() => setUserDropdownOpen((prev) => !prev)}
              sx={{
                p: 1.5,
                borderRadius: userDropdownOpen ? '8px 8px 0 0' : '8px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: 'action.selected' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                <Avatar src={avatarUrl} sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 13, fontWeight: 700 }}>
                  {!avatarUrl && avatarLetter}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }} noWrap>
                    {displayName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.72rem' }} noWrap>
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              <ChevronDown
                size={18}
                style={{
                  color: 'var(--mui-palette-text-secondary, #666)',
                  transform: userDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                  flexShrink: 0,
                  marginLeft: 8,
                }}
              />
            </Box>

            <Collapse in={userDropdownOpen}>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  bgcolor: 'background.paper',
                  p: 0.5,
                }}
              >
                <ListItemButton
                  onClick={() => handleNavigate('/profile')}
                  sx={{ borderRadius: '6px', py: 0.8, px: 1.5, gap: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 28, color: 'primary.main' }}>
                    <User size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Το Προφίλ μου" primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: 600 }} />
                </ListItemButton>

                {isAdmin && (
                  <ListItemButton
                    onClick={() => handleNavigate('/admin')}
                    sx={{ borderRadius: '6px', py: 0.8, px: 1.5, gap: 1 }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, color: 'primary.main' }}>
                      <LayoutDashboard size={18} />
                    </ListItemIcon>
                    <ListItemText primary="Admin Dashboard" primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: 600 }} />
                  </ListItemButton>
                )}

                <Divider sx={{ my: 0.5 }} />

                <ListItemButton
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  sx={{ borderRadius: '6px', py: 0.8, px: 1.5, gap: 1, color: 'error.main' }}
                >
                  <ListItemIcon sx={{ minWidth: 28, color: 'inherit' }}>
                    <LogOut size={18} />
                  </ListItemIcon>
                  <ListItemText primary="Αποσύνδεση" primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: 600, color: 'inherit' }} />
                </ListItemButton>
              </Box>
            </Collapse>
          </Box>
        ) : (
          <Box sx={{ mx: 2, mt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => handleNavigate('/login')}
              sx={{ borderRadius: '8px', py: 1, fontWeight: 700, fontSize: '0.875rem' }}
            >
              Είσοδος
            </Button>
          </Box>
        )}

        {/* Navigation list */}
        <List sx={{ px: 1.5, py: 2, flexGrow: 1, overflowY: 'auto' }}>
          {items.map((item) => {
            const active = isActive(item.to);
            return (
              <ListItemButton
                key={item.label}
                onClick={() => handleNavigate(item.to)}
                sx={{
                  borderRadius: '8px',
                  mb: 0.5,
                  py: 0.9,
                  px: 1.5,
                  bgcolor: active ? 'action.selected' : 'transparent',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: active ? 'primary.main' : 'text.secondary' }}>
                  {React.isValidElement(item.icon)
                    ? React.cloneElement(item.icon, { size: 18, strokeWidth: 2 })
                    : item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.85rem',
                    color: active ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};
