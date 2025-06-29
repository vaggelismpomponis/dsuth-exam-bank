import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Skeleton, ListItemIcon, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useSnackbar } from 'notistack';

const ADMIN_UID = 'ae26da15-7102-4647-8cbb-8f045491433c';

const NavBar = () => {
  const [user, setUser] = useState(undefined);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const openSettings = Boolean(settingsAnchorEl);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    enqueueSnackbar('Αποσυνδεθήκατε με επιτυχία!', { variant: 'success' });
    navigate('/');
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };
  const handleLogoutMenu = async () => {
    await handleLogout();
    handleClose();
  };
  const handleSettingsMenu = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const menuItems = [
    { label: 'Ανέβασμα Αρχείων', to: '/upload' },
    ...(user && user.id === ADMIN_UID ? [{ label: 'Admin', to: '/admin' }] : []),
    user
      ? { label: 'Αποσύνδεση', action: handleLogout }
      : { label: 'Είσοδος', to: '/login' },
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ top: 0, zIndex: theme.zIndex.appBar + 1, boxShadow: 0, background: '#282828' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: { xs: 56, md: 64 }, p: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: { xs: 1, sm: 0 } }}>
            <Typography
              variant="h5"
              className="navbar-title"
              sx={{
                fontWeight: 800,
                fontSize: { xs: 22, md: 28 },
                color: '#fff',
                letterSpacing: 1.5,
                userSelect: 'none',
                textDecoration: 'none',
                cursor: 'pointer',
                px: 2,
                py: 0.5,
                borderRadius: 1.5,
              }}
              component={Link}
              to="/"
            >
              DSUth Exam Bank
            </Typography>
          </Box>
          {/* Mobile/Tablet */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Hamburger menu μόνο */}
            <IconButton color="inherit" edge="end" onClick={() => setMobileOpen(true)} sx={{ mx: 1.5, '&:focus, &:focus-visible': { outline: 'none', boxShadow: 'none', border: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}
              PaperProps={{
                sx: {
                  width: 260,
                  borderTopLeftRadius: 24,
                  borderBottomLeftRadius: 24,
                  bgcolor: 'linear-gradient(135deg, #e3f0ff 0%, #f9fbff 100%)',
                  boxShadow: 6,
                  p: 0,
                  overflow: 'hidden',
                }
              }}
            >
              <Box sx={{ width: '100%', position: 'relative', minHeight: '100vh', p: 0 }} role="presentation" onClick={() => setMobileOpen(false)}>
                {/* Header with logo/title and close */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 2, bgcolor: 'rgba(40,56,80,0.07)', borderBottom: '1px solid #e0e7ef' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e', letterSpacing: 0.5 }}>
                    Τράπεζα UTH
                  </Typography>
                  <IconButton
                    edge="end"
                    aria-label="close"
                    onClick={(e) => { e.stopPropagation(); setMobileOpen(false); }}
                    sx={{
                      color: 'grey.700',
                      position: 'absolute', right: 14, top: 5, p: 1.2,
                      '&:focus, &:focus-visible': { outline: 'none !important', boxShadow: 'none !important', border: 'none !important' }
                    }}
                  >
                    <CloseIcon fontSize="large" />
                  </IconButton>
                </Box>
                <List sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', p: 0, mt: 1 }}>
                  <ListItemButton component={Link} to="/" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#e3eaff' }, justifyContent: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#1a237e' }}><HomeIcon /></ListItemIcon>
                    <ListItemText primary="ΑΡΧΙΚΗ" sx={{ color: '#1a237e', fontWeight: 600 }} />
                  </ListItemButton>
                  <ListItemButton component={Link} to="/courses" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#e3eaff' }, justifyContent: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#1976d2' }}><MenuBookIcon /></ListItemIcon>
                    <ListItemText primary="ΜΑΘΗΜΑΤΑ" sx={{ color: '#1976d2', fontWeight: 600 }} />
                  </ListItemButton>
                  <ListItemButton component={Link} to="/favorites" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#ffe3e3' }, justifyContent: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#e53935' }}><FavoriteIcon /></ListItemIcon>
                    <ListItemText primary="ΑΓΑΠΗΜΕΝΑ" sx={{ color: '#e53935', fontWeight: 600 }} />
                  </ListItemButton>
                  <ListItemButton component={Link} to="/upload" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#e3f7e3' }, justifyContent: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#43a047' }}><UploadFileIcon /></ListItemIcon>
                    <ListItemText primary="ΑΝΕΒΑΣΜΑ ΑΡΧΕΙΩΝ" sx={{ color: '#43a047', fontWeight: 600 }} />
                  </ListItemButton>
                  <ListItemButton component={Link} to="/contact" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#e0f7fa' }, justifyContent: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 36, color: '#00bcd4' }}><ContactSupportIcon /></ListItemIcon>
                    <ListItemText primary="ΕΠΙΚΟΙΝΩΝΙΑ" sx={{ color: '#00bcd4', fontWeight: 600 }} />
                  </ListItemButton>
                  {/* Divider */}
                  <Divider sx={{ my: 1, mx: 2 }} />
                  {/* Profile/Admin/Login/Logout */}
                  {user && (
                    <>
                      {user.id === ADMIN_UID && (
                        <ListItemButton component={Link} to="/admin" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#fffbe3' }, justifyContent: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 36, color: '#fbc02d' }}><SettingsIcon /></ListItemIcon>
                          <ListItemText primary="ΡΥΘΜΙΣΕΙΣ ADMIN" sx={{ color: '#fbc02d', fontWeight: 600 }} />
                        </ListItemButton>
                      )}
                      <ListItemButton component={Link} to="/profile" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#e3eaff' }, justifyContent: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 36, color: '#1976d2' }}><AccountCircle /></ListItemIcon>
                        <ListItemText primary="ΡΥΘΜΙΣΕΙΣ ΠΡΟΦΙΛ" sx={{ color: '#1976d2', fontWeight: 600 }} />
                      </ListItemButton>
                      <ListItemButton onClick={handleLogout} sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#ffe3e3' }, justifyContent: 'flex-start' }}>
                        <ListItemIcon sx={{ minWidth: 36, color: '#e53935' }}><LogoutIcon /></ListItemIcon>
                        <ListItemText primary="ΑΠΟΣΥΝΔΕΣΗ" sx={{ color: '#e53935', fontWeight: 600 }} />
                      </ListItemButton>
                    </>
                  )}
                  {!user && (
                    <ListItemButton component={Link} to="/login" sx={{ my: 0.5, mx: 2, borderRadius: 2, py: 1.5, px: 2, '&:hover': { bgcolor: '#e3eaff' }, justifyContent: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 36, color: '#1976d2' }}><LoginIcon /></ListItemIcon>
                      <ListItemText primary="ΕΙΣΟΔΟΣ" sx={{ color: '#1976d2', fontWeight: 600 }} />
                    </ListItemButton>
                  )}
                </List>
              </Box>
            </Drawer>
          </Box>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default NavBar; 