import React, { useEffect, useState, useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Sun,
  Moon,
  Menu,
  X,
  Home,
  BookOpen,
  Upload,
  MessageSquare,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ColorModeContext } from '../context/ColorModeContext';
import { AdminSidebarContext } from '../context/AdminSidebarContext';
import { supabase } from '../supabaseClient';
import { isUserAdmin } from '../utils/adminUtils';
import { NavBrand } from './navbar/NavBrand';
import { NavDesktopLinks } from './navbar/NavDesktopLinks';
import { NavUserMenu } from './navbar/NavUserMenu';
import { NavDrawer } from './navbar/NavDrawer';

const NAV_LINKS = [
  { label: 'Αρχική', to: '/', icon: <Home size={18} /> },
  { label: 'Μαθήματα', to: '/courses', icon: <BookOpen size={18} /> },
  { label: 'Ανέβασμα', to: '/upload', icon: <Upload size={18} /> },
  { label: 'Αιτήματα', to: '/requests', icon: <MessageSquare size={18} /> },
  { label: 'Αγαπημένα', to: '/favorites', icon: <Heart size={18} /> },
  { label: 'Επικοινωνία', to: '/contact', icon: <HelpCircle size={18} /> },
];

const MORE_LINKS = [];

const DRAWER_ITEMS = [
  ...NAV_LINKS,
];

const NavBar = () => {
  const [user, setUser] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const adminSidebar = useContext(AdminSidebarContext);
  const location = useLocation();
  const navigate = useNavigate();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const checkAdmin = async (u) => {
      if (!u) { setIsAdmin(false); return; }
      const status = await isUserAdmin(u.id);
      setIsAdmin(status);
    };

    supabase.auth.getSession().then(({ data }) => {
      const u = data?.session?.user || null;
      setUser(u);
      checkAdmin(u);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setUser(u);
      checkAdmin(u);
    });

    return () => { listener?.subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) localStorage.removeItem(key);
    });
    setUser(null);
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          borderRadius: 0,
          pt: 'env(safe-area-inset-top, 0px)',
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: isDark ? 'rgba(18, 18, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: { xs: 56, md: 64 },
            px: { xs: 2, sm: 2.5, md: 2, lg: 3.5, xl: 4 },
            maxWidth: 1280,
            width: '100%',
            mx: 'auto',
          }}
        >
          <NavBrand
            isAdminRoute={isAdminRoute}
            onAdminToggle={adminSidebar.onToggle}
            showAdminToggle={!isMobile}
          />

          {!isMobile && !isAdminRoute && (
            <NavDesktopLinks links={NAV_LINKS} moreLinks={MORE_LINKS} />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={colorMode.toggleColorMode}
              size="small"
              aria-label="Εναλλαγή θέματος"
              sx={{ color: 'text.secondary', width: 36, height: 36, borderRadius: '8px' }}
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </IconButton>

            {/* Desktop user profile avatar & popover menu (hidden on mobile) */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <NavUserMenu user={user} isAdmin={isAdmin} onLogout={handleLogout} isMobile={false} />
            </Box>

            {/* Hamburger button: STRICTLY mobile only (hidden on desktop) */}
            <IconButton
              onClick={() => setMobileOpen(!mobileOpen)}
              size="small"
              aria-label={mobileOpen ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού'}
              sx={{
                color: 'text.primary',
                width: 36,
                height: 36,
                borderRadius: '8px',
                display: { xs: 'inline-flex', md: 'none' },
              }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <NavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        items={DRAWER_ITEMS}
        user={user}
        isAdmin={isAdmin}
        onLogout={handleLogout}
      />
    </>
  );
};

export default NavBar;
