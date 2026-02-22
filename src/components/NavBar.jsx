import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Drawer, List, ListItemButton, ListItemText, ListItemIcon, useTheme, useMediaQuery, Divider, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext, AdminSidebarContext } from '../App';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
import HomeIcon from '@mui/icons-material/Home';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useSnackbar } from 'notistack';
import { isUserAdmin } from '../utils/adminUtils';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const NavBar = () => {
  const [user, setUser] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const { enqueueSnackbar } = useSnackbar();
  const location = useLocation();
  const adminSidebar = React.useContext(AdminSidebarContext);
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    const checkAdminStatus = async (user) => {
      if (!user) { setIsAdmin(false); return; }
      const adminStatus = await isUserAdmin(user.id);
      setIsAdmin(adminStatus);
    };

    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      checkAdminStatus(currentUser);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      checkAdminStatus(currentUser);
    });

    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    enqueueSnackbar('Αποσυνδεθήκατε με επιτυχία!', { variant: 'success' });
    navigate('/');
  };

  const drawerItems = [
    { label: 'Αρχική', to: '/', icon: <HomeIcon /> },
    { label: 'Μαθήματα', to: '/courses', icon: <MenuBookIcon /> },
    { label: 'Αγαπημένα', to: '/favorites', icon: <FavoriteIcon /> },
    { label: 'Ανέβασμα', to: '/upload', icon: <UploadFileIcon /> },
    { label: 'Αιτήματα', to: '/requests', icon: <QuestionAnswerIcon /> },
    { label: 'Επικοινωνία', to: '/contact', icon: <ContactSupportIcon /> },
  ];

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          top: 0,
          pt: 'env(safe-area-inset-top, 0px)',
          zIndex: theme.zIndex.drawer + 1,
          background: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(32,33,36,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: { xs: 56, md: 64 }, px: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Admin hamburger */}
            {isAdminRoute && adminSidebar.onToggle && (
              <IconButton
                edge="start"
                onClick={adminSidebar.onToggle}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            )}
            {/* Brand */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: { xs: 18, md: 20 },
                color: 'primary.main',
                letterSpacing: '-0.01em',
                userSelect: 'none',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/');
                }
              }}
            >
              DSUth Exam Bank
            </Typography>
          </Box>

          {/* Right side */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Theme Toggle */}
            <IconButton sx={{ mr: 0.5, color: 'text.secondary' }} onClick={colorMode.toggleColorMode}>
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* User avatar / login */}
            {user ? (
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ ml: 0.5 }}
              >
                <Avatar
                  src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: 'primary.main',
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {!(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) && (user.email?.[0]?.toUpperCase() || 'U')}
                </Avatar>
              </IconButton>
            ) : (
              <IconButton
                component={Link}
                to="/login"
                sx={{ color: 'text.secondary' }}
              >
                <AccountCircle sx={{ fontSize: 30 }} />
              </IconButton>
            )}

            {/* User menu */}
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              slotProps={{
                paper: {
                  sx: { borderRadius: 3, minWidth: 200, mt: 1, p: 1, boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem
                onClick={() => { navigate('/profile'); setAnchorEl(null); }}
                sx={{ borderRadius: 2, mb: 0.5, py: 1.2, px: 2, '&:hover': { bgcolor: (theme) => theme.palette.mode === 'light' ? 'primary.light' : 'rgba(255, 255, 255, 0.08)' } }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Προφίλ" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem', color: 'text.primary' }} />
              </MenuItem>
              {isAdmin && (
                <MenuItem
                  onClick={() => { navigate('/admin'); setAnchorEl(null); }}
                  sx={{ borderRadius: 2, mb: 0.5, py: 1.2, px: 2, '&:hover': { bgcolor: (theme) => theme.palette.mode === 'light' ? 'primary.light' : 'rgba(255, 255, 255, 0.08)' } }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Admin" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem', color: 'text.primary' }} />
                </MenuItem>
              )}
              <Divider sx={{ my: 0.5 }} />
              <MenuItem
                onClick={() => { handleLogout(); setAnchorEl(null); }}
                sx={{ borderRadius: 2, py: 1.2, px: 2, '&:hover': { bgcolor: 'error.light', color: 'error.dark' }, color: 'error.main' }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Αποσύνδεση" primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem', color: 'inherit' }} />
              </MenuItem>
            </Menu>

            {/* Hamburger — visible everywhere */}
            <IconButton
              edge="end"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ color: 'text.primary' }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: 'background.paper',
            p: 0,
          }
        }}
      >
        <Box sx={{ width: '100%', minHeight: '100vh', pt: 'env(safe-area-inset-top, 0px)' }} role="presentation" onClick={() => setMobileOpen(false)}>
          {/* Drawer Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', fontSize: 17 }}>
              DSUth Exam Bank
            </Typography>
            <IconButton
              edge="end"
              onClick={(e) => { e.stopPropagation(); setMobileOpen(false); }}
              sx={{ color: 'text.secondary' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Drawer Links */}
          <List sx={{ px: 1.5, pt: 1 }}>
            {drawerItems.map((item) => (
              <ListItemButton
                key={item.label}
                component={Link}
                to={item.to}
                sx={{
                  borderRadius: 3,
                  mb: 0.5,
                  py: 1.2,
                  px: 2,
                  '&:hover': { bgcolor: (theme) => theme.palette.mode === 'light' ? 'primary.light' : 'rgba(255, 255, 255, 0.08)' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem', color: 'text.primary' }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default NavBar;