import React, { useEffect, useState } from 'react';
import {
  AppBar, Toolbar, Typography, Box, IconButton, Drawer,
  List, ListItemButton, ListItemText, ListItemIcon,
  useTheme, useMediaQuery, Avatar, Divider, Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from '../context/ColorModeContext';
import { AdminSidebarContext } from '../context/AdminSidebarContext';
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
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';

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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

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
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Logout error:", err);
    }
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        localStorage.removeItem(key);
      }
    });
    setUser(null);
    enqueueSnackbar('Αποσυνδεθήκατε με επιτυχία!', { variant: 'success' });
    navigate('/');
    window.location.reload();
  };

  const navLinks = [
    { label: 'Αρχική', to: '/', icon: <HomeIcon sx={{ fontSize: 18 }} /> },
    { label: 'Μαθήματα', to: '/courses', icon: <MenuBookIcon sx={{ fontSize: 18 }} /> },
    { label: 'Ανέβασμα', to: '/upload', icon: <UploadFileIcon sx={{ fontSize: 18 }} /> },
    { label: 'Φοιτητές', to: '/students', icon: <GroupIcon sx={{ fontSize: 18 }} /> },
    { label: 'Επικοινωνία', to: '/contact', icon: <ContactSupportIcon sx={{ fontSize: 18 }} /> },
  ];

  const drawerItems = [
    { label: 'Αρχική', to: '/', icon: <HomeIcon /> },
    { label: 'Μαθήματα', to: '/courses', icon: <MenuBookIcon /> },
    { label: 'Αγαπημένα', to: '/favorites', icon: <FavoriteIcon /> },
    { label: 'Ανέβασμα', to: '/upload', icon: <UploadFileIcon /> },
    { label: 'Φοιτητές', to: '/students', icon: <GroupIcon /> },
    { label: 'Αιτήματα', to: '/requests', icon: <QuestionAnswerIcon /> },
    { label: 'Επικοινωνία', to: '/contact', icon: <ContactSupportIcon /> },
  ];

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const avatarLetter = user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          top: 0,
          pt: 'env(safe-area-inset-top, 0px)',
          zIndex: theme.zIndex.drawer + 1,
          background: isDark
            ? 'rgba(18, 18, 20, 0.82)'
            : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          boxShadow: 'none',
          borderRadius: 0,
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: { xs: 56, md: 64 },
            px: { xs: 2, md: 4 },
            maxWidth: 1280,
            width: '100%',
            mx: 'auto',
          }}
        >
          {/* Left: Admin toggle + Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAdminRoute && adminSidebar.onToggle && (
              <IconButton
                edge="start"
                onClick={adminSidebar.onToggle}
                sx={{ color: 'text.primary', mr: 0.5 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            {/* Brand logo */}
            <Box
              onClick={() => {
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/');
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <Box
                component="img"
                src="/favicon.png"
                alt="DS Logo"
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 0,
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(26,115,232,0.35)',
                }}
              />
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1rem', md: '1.05rem' },
                  color: 'text.primary',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                DSUth<Box component="span" sx={{ color: 'primary.main' }}> Exam</Box>
              </Typography>
            </Box>
          </Box>

          {/* Center: Desktop nav links */}
          {!isMobile && !isAdminRoute && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {navLinks.map((link) => {
                const active = isActive(link.to);
                return (
                  <Box
                    key={link.to}
                    component={Link}
                    to={link.to}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.6,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 0,
                      fontSize: '0.875rem',
                      fontWeight: active ? 700 : 500,
                      color: active ? 'primary.main' : 'text.secondary',
                      bgcolor: active
                        ? isDark ? 'rgba(26,115,232,0.12)' : 'rgba(26,115,232,0.08)'
                        : 'transparent',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        color: 'primary.main',
                        bgcolor: isDark ? 'rgba(26,115,232,0.10)' : 'rgba(26,115,232,0.06)',
                        textDecoration: 'none',
                      },
                    }}
                  >
                    {link.icon}
                    {link.label}
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Right: Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Theme toggle */}
            <IconButton
              onClick={colorMode.toggleColorMode}
              size="small"
              sx={{
                color: 'text.secondary',
                width: 36,
                height: 36,
                borderRadius: 0,
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              {isDark ? <Brightness7Icon sx={{ fontSize: 19 }} /> : <Brightness4Icon sx={{ fontSize: 19 }} />}
            </IconButton>

            {/* User avatar / login */}
            {user ? (
              <>
                <IconButton
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  size="small"
                  sx={{ p: 0.5, ml: 0.5 }}
                >
                  <Avatar
                    src={avatarUrl}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: 13,
                      fontWeight: 700,
                      border: '2px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(26,115,232,0.2)',
                    }}
                  >
                    {!avatarUrl && avatarLetter}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={() => setAnchorEl(null)}
                  slotProps={{
                    paper: {
                      sx: {
                        borderRadius: '14px',
                        minWidth: 200,
                        mt: 1.5,
                        p: 0.75,
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        boxShadow: isDark
                          ? '0 8px 32px rgba(0,0,0,0.5)'
                          : '0 8px 32px rgba(0,0,0,0.12)',
                        bgcolor: isDark ? '#1c1d1f' : '#fff',
                      },
                    },
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  disableScrollLock={true}
                >
                  {/* User info */}
                  <Box sx={{ px: 2, py: 1.5, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.875rem' }} noWrap>
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Χρήστης'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }} noWrap>
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 0.75 }} />
                  <MenuItem
                    onClick={() => { navigate('/profile'); setAnchorEl(null); }}
                    sx={{ borderRadius: 0, mb: 0.25, py: 1, px: 1.5, gap: 1.5 }}
                  >
                    <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', color: 'text.primary' }}>Προφίλ</Typography>
                  </MenuItem>
                  {isAdmin && (
                    <MenuItem
                      onClick={() => { navigate('/admin'); setAnchorEl(null); }}
                      sx={{ borderRadius: 0, mb: 0.25, py: 1, px: 1.5, gap: 1.5 }}
                    >
                      <DashboardIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', color: 'text.primary' }}>Dashboard</Typography>
                    </MenuItem>
                  )}
                  <Divider sx={{ my: 0.75 }} />
                  <MenuItem
                    onClick={() => { handleLogout(); setAnchorEl(null); }}
                    sx={{ borderRadius: 0, py: 1, px: 1.5, gap: 1.5, color: 'error.main', '&:hover': { bgcolor: 'error.light', color: '#fff' } }}
                  >
                    <LogoutIcon sx={{ fontSize: 18, color: 'inherit' }} />
                    <Typography sx={{ fontWeight: 500, fontSize: '0.875rem', color: 'inherit' }}>Αποσύνδεση</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {!isMobile && (
                  <Button
                    component={Link}
                    to="/login"
                    variant="contained"
                    size="small"
                    sx={{
                      ml: 0.5,
                      px: 2,
                      py: 0.7,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      borderRadius: 0,
                    }}
                  >
                    Είσοδος
                  </Button>
                )}
                {isMobile && (
                  <IconButton
                    component={Link}
                    to="/login"
                    size="small"
                    sx={{ color: 'text.secondary', width: 36, height: 36, borderRadius: 0 }}
                  >
                    <LoginIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                )}
              </>
            )}

            {/* Hamburger (always visible) */}
            <IconButton
              onClick={() => setMobileOpen(!mobileOpen)}
              size="small"
              sx={{
                ml: 0.5,
                color: 'text.primary',
                width: 36,
                height: 36,
                borderRadius: 0,
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              {mobileOpen ? <CloseIcon sx={{ fontSize: 20 }} /> : <MenuIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ disableScrollLock: true }}
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: isDark ? '#16171a' : '#fff',
            borderRadius: 0,
            border: 'none',
            boxShadow: isDark ? '-8px 0 40px rgba(0,0,0,0.5)' : '-8px 0 40px rgba(0,0,0,0.1)',
          },
        }}
      >
        <Box sx={{ width: 300, minHeight: '100vh', pt: 'env(safe-area-inset-top, 0px)' }} role="presentation">
          {/* Drawer Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              py: 2,
              borderBottom: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                component="img"
                src="/favicon.png"
                alt="DS Logo"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 0,
                }}
              />
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: 'text.primary', letterSpacing: '-0.01em' }}>
                DSUth Exam Bank
              </Typography>
            </Box>
            <IconButton
              onClick={(e) => { e.stopPropagation(); setMobileOpen(false); }}
              size="small"
              sx={{ color: 'text.secondary', width: 32, height: 32, borderRadius: 0 }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* User info in drawer */}
          {user && (
            <Box
              sx={{
                mx: 2,
                mt: 2,
                p: 2,
                borderRadius: 0,
                bgcolor: isDark ? 'rgba(26,115,232,0.08)' : 'rgba(26,115,232,0.05)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(26,115,232,0.2)' : 'rgba(26,115,232,0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <Avatar
                src={avatarUrl}
                sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700, flexShrink: 0 }}
              >
                {!avatarUrl && avatarLetter}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }} noWrap>
                  {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Χρήστης'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }} noWrap>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Drawer Links */}
          <List sx={{ px: 1.5, pt: 1.5 }}>
            {drawerItems.map((item) => {
              const active = isActive(item.to);
              return (
                <ListItemButton
                  key={item.label}
                  onClick={() => { navigate(item.to); setMobileOpen(false); }}
                  sx={{
                    borderRadius: 0,
                    mb: 0.5,
                    py: 1.2,
                    px: 2,
                    bgcolor: active
                      ? isDark ? 'rgba(26,115,232,0.12)' : 'rgba(26,115,232,0.08)'
                      : 'transparent',
                    '&:hover': {
                      bgcolor: active
                        ? isDark ? 'rgba(26,115,232,0.16)' : 'rgba(26,115,232,0.12)'
                        : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'text.secondary' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: active ? 700 : 500,
                      fontSize: '0.9rem',
                      color: active ? 'primary.main' : 'text.primary',
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>

          {/* Bottom actions */}
          <Box sx={{ px: 2.5, mt: 'auto', pb: 3, pt: 2, borderTop: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
            {user ? (
              <>
                {isAdmin && (
                  <Box
                    onClick={() => { navigate('/admin'); setMobileOpen(false); }}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      mb: 1,
                      borderRadius: 0,
                      cursor: 'pointer',
                      color: 'primary.main',
                      '&:hover': { bgcolor: isDark ? 'rgba(26,115,232,0.12)' : 'rgba(26,115,232,0.08)' },
                    }}
                  >
                    <DashboardIcon sx={{ fontSize: 20, color: 'inherit' }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'inherit' }}>Dashboard</Typography>
                  </Box>
                )}
                <Box
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 0,
                  cursor: 'pointer',
                  color: 'error.main',
                  '&:hover': { bgcolor: 'error.light', color: '#fff' },
                }}
              >
                <LogoutIcon sx={{ fontSize: 20, color: 'inherit' }} />
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: 'inherit' }}>Αποσύνδεση</Typography>
              </Box>
              </>
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={() => { navigate('/login'); setMobileOpen(false); }}
                sx={{ borderRadius: 0, py: 1.2, fontWeight: 700 }}
              >
                Είσοδος
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default NavBar;