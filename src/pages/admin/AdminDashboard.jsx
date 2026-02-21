import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItemIcon, ListItemText, Toolbar, AppBar, Typography, Box, Button, IconButton, useTheme, useMediaQuery, ListItemButton, Divider, Grid, Card, CardActionArea, CardContent
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import BookIcon from '@mui/icons-material/Book';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import HelpIcon from '@mui/icons-material/Help';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SchoolIcon from '@mui/icons-material/School';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AdminCourses from './AdminCourses';
import { supabase } from '../../supabaseClient';
import { AdminSidebarContext } from '../../App';

const drawerWidth = 220;
const collapsedWidth = 100;
const sidebarTop = { xs: '0px', md: '0px' };

const adminMenu = [
  { text: 'Διαχείριση Αρχείων', icon: <FolderIcon />, path: '/admin/files' },
  { text: 'Διαχείριση Χρηστών', icon: <PeopleIcon />, path: '/admin/users' },
  { text: 'Διαχείριση Μαθημάτων', icon: <BookIcon />, path: '/admin/courses' },
  { text: 'Μαζικό Upload', icon: <CloudUploadIcon />, path: '/admin/upload' },
  { text: 'Αιτήματα Αρχείων', icon: <HelpIcon />, path: '/admin/requests' },
];

const cardBg = (theme) => ({
  background: theme.palette.mode === 'light' ? '#f8fafc' : 'background.paper',
  boxShadow: theme.palette.mode === 'light' ? '0 2px 12px 0 rgba(31,38,135,0.08)' : '0 4px 20px 0 rgba(0,0,0,0.4)',
  borderRadius: '18px',
  border: `1px solid ${theme.palette.mode === 'light' ? '#e3eafc' : 'rgba(255,255,255,0.05)'}`,
});

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userCount, setUserCount] = useState(null);
  const [pendingFilesCount, setPendingFilesCount] = useState(null);
  const [openRequestsCount, setOpenRequestsCount] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) setMobileOpen(!mobileOpen);
    else setDrawerOpen(!drawerOpen);
  };

  useEffect(() => {
    if (location.pathname === '/admin') {
      setMetricsLoading(true);
      Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('exams').select('id', { count: 'exact', head: true }).eq('approved', false),
        supabase.from('file_requests').select('id', { count: 'exact', head: true }).eq('status', 'open')
      ]).then(([users, pendingFiles, openRequests]) => {
        setUserCount(users.count ?? 0);
        setPendingFilesCount(pendingFiles.count ?? 0);
        setOpenRequestsCount(openRequests.count ?? 0);
        setMetricsLoading(false);
      });
    }
  }, [location.pathname]);

  const drawerContent = (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Box sx={{
        position: { xs: 'relative', sm: 'fixed' },
        top: { xs: 0, sm: sidebarTop },
        left: { sm: 0 },
        width: { xs: '100%', sm: drawerOpen ? `${drawerWidth}px` : `${collapsedWidth}px` },
        height: { xs: '100%', sm: `calc(100vh - ${drawerOpen ? sidebarTop.md : sidebarTop.xs})` },
        zIndex: 1199,
        ...cardBg(theme),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'width 0.45s cubic-bezier(0.4,0,0.2,1)',
        p: 0,
      }}>
        <Box sx={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', p: 1, overflowY: { xs: 'auto', sm: 'hidden' } }}>
          <List sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', p: 0, pt: 2, mb: 2 }}>
            {/* Επιστροφή στο site επιλογή */}
            <ListItemButton
              selected={location.pathname === '/'}
              onClick={() => {
                navigate('/');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                px: 2.5,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                width: '100%',
                background: 'transparent !important',
                boxShadow: 'none',
                transition: 'transform 0.15s',
                minHeight: 48,
                '&:hover, &.Mui-selected': {
                  backgroundColor: 'transparent !important',
                  background: 'transparent !important',
                  transform: 'scale(1.08)',
                  '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    transform: 'scale(1.08)',
                  },
                },
                '&.Mui-focusVisible': {
                  backgroundColor: 'transparent !important',
                  background: 'transparent !important',
                },
                '&.Mui-active': {
                  backgroundColor: 'transparent !important',
                  background: 'transparent !important',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  mb: 0.5,
                  color: location.pathname === '/' ? 'primary.main' : 'text.primary',
                  display: 'flex',
                  fontSize: 0,
                  transition: 'transform 0.2s',
                }}
              >
                <HomeIcon sx={{ fontSize: drawerOpen || isMobile ? 26 : 32, transition: 'font-size 0.2s', mx: 'auto' }} />
              </ListItemIcon>
              {(drawerOpen || isMobile) && (
                <ListItemText
                  primary={'Επιστροφή στο site'}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: 15,
                    sx: {
                      transition: 'transform 0.2s',
                      textAlign: 'center',
                    }
                  }}
                  sx={{
                    transition: 'transform 0.2s',
                    textAlign: 'center',
                  }}
                />
              )}
            </ListItemButton>
            <Divider sx={{ width: '100%', my: 1, borderColor: 'divider' }} />
            {/* Αρχική Admin */}
            <ListItemButton
              selected={location.pathname === '/admin'}
              onClick={() => {
                navigate('/admin');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                mb: 1,
                borderRadius: 2,
                px: drawerOpen || isMobile ? 2.5 : 1.5,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                width: '100%',
                background: 'transparent !important',
                boxShadow: 'none',
                transition: 'transform 0.15s',
                minHeight: 48,
                '&:hover, &.Mui-selected': {
                  backgroundColor: 'transparent !important',
                  background: 'transparent !important',
                  transform: 'scale(1.08)',
                  '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                    transform: 'scale(1.08)',
                  },
                },
                '&.Mui-focusVisible': {
                  backgroundColor: 'transparent !important',
                  background: 'transparent !important',
                },
                '&.Mui-active': {
                  backgroundColor: 'transparent !important',
                  background: 'transparent !important',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignSelf: 'center',
                  mb: 0.5,
                  color: location.pathname === '/admin' ? 'primary.main' : 'text.primary',
                  display: 'flex',
                  fontSize: 0,
                  transition: 'transform 0.2s',
                }}
              >
                <DashboardIcon sx={{ fontSize: drawerOpen || isMobile ? 26 : 32, transition: 'font-size 0.2s', mx: 'auto' }} />
              </ListItemIcon>
              {(drawerOpen || isMobile) && (
                <ListItemText
                  primary={'Αρχική Admin'}
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: 15,
                    sx: {
                      transition: 'transform 0.2s',
                      textAlign: 'center',
                    }
                  }}
                  sx={{
                    transition: 'transform 0.2s',
                    textAlign: 'center',
                  }}
                />
              )}
            </ListItemButton>
            {/* Admin Menu */}
            {adminMenu.map((item) => (
              <ListItemButton
                key={item.text}
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  mb: item === adminMenu[adminMenu.length - 1] ? 0 : 1,
                  borderRadius: 2,
                  px: drawerOpen || isMobile ? 2.5 : 1.5,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  width: '100%',
                  background: 'transparent !important',
                  boxShadow: 'none',
                  transition: 'transform 0.15s',
                  minHeight: 48,
                  '&:hover, &.Mui-selected': {
                    backgroundColor: 'transparent !important',
                    background: 'transparent !important',
                    transform: 'scale(1.08)',
                    '& .MuiListItemIcon-root, & .MuiListItemText-root': {
                      transform: 'scale(1.08)',
                    },
                  },
                  '&.Mui-focusVisible': {
                    backgroundColor: 'transparent !important',
                    background: 'transparent !important',
                  },
                  '&.Mui-active': {
                    backgroundColor: 'transparent !important',
                    background: 'transparent !important',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    mb: 0.5,
                    color: location.pathname === item.path ? 'primary.main' : 'text.primary',
                    display: 'flex',
                    fontSize: 0,
                    transition: 'transform 0.2s',
                  }}
                >
                  {React.cloneElement(item.icon, {
                    fontSize: drawerOpen || isMobile ? 'medium' : 'large',
                    style: {
                      fontSize: drawerOpen || isMobile ? 26 : 32,
                      transition: 'font-size 0.2s',
                    },
                  })}
                </ListItemIcon>
                {(drawerOpen || isMobile) && (
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: 15,
                      sx: {
                        transition: 'transform 0.2s',
                        textAlign: 'center',
                      }
                    }}
                    sx={{
                      transition: 'transform 0.2s',
                      textAlign: 'center',
                    }}
                  />
                )}
              </ListItemButton>
            ))}
          </List>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: { xs: 4, sm: 2 }, py: { xs: 1.5, sm: 0 } }}>
            <Typography
              sx={{
                textAlign: 'center',
                color: theme.palette.mode === 'light' ? '#1a237e' : 'text.primary',
                opacity: { xs: 1, sm: 0.7 },
                fontSize: { xs: 17, sm: 13 },
                fontWeight: { xs: 700, sm: 400 },
                letterSpacing: 0.5,
                lineHeight: 1.2,
              }}
            >
              DSUth <br /> Admin
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <AdminSidebarContext.Provider value={{ onToggle: handleDrawerToggle }}>
      <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.palette.mode === 'light' ? 'linear-gradient(135deg, #e3eafc 0%, #f4f6f8 100%)' : 'background.default', overflowX: 'hidden' }}>
        {/* Sidebar Drawer */}
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              [`& .MuiDrawer-paper`]: {
                width: 260,
                boxSizing: 'border-box',
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                position: 'fixed',
                top: sidebarTop,
                height: `calc(100vh - ${sidebarTop.xs})`,
                zIndex: 1199,
                transition: 'width 0.45s cubic-bezier(0.4,0,0.2,1)',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open={drawerOpen}
            sx={{
              width: drawerOpen ? drawerWidth : collapsedWidth,
              flexShrink: 0,
              transition: 'width 0.45s cubic-bezier(0.4,0,0.2,1)',
              [`& .MuiDrawer-paper`]: {
                width: drawerOpen ? drawerWidth : collapsedWidth,
                boxSizing: 'border-box',
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                overflowX: 'hidden',
                position: 'fixed',
                top: sidebarTop,
                height: `calc(100vh - ${sidebarTop.md})`,
                p: 1,
                zIndex: 1199,
                transition: 'width 0.45s cubic-bezier(0.4,0,0.2,1)',
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            ml: { xs: 0, sm: drawerOpen ? `${drawerWidth}px` : `${collapsedWidth}px` },
            px: { xs: 1, sm: 3 },
            py: { xs: 2, sm: 3 },
            pt: { xs: 2, md: 3 },
            transition: theme.transitions.create(['margin-left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            maxWidth: '100vw',
            overflowX: 'hidden',
            background: 'none',
          }}
        >
          <Box sx={{
            width: '100%',
            maxWidth: 900,
            mx: 'auto',
            my: 'auto',
            p: { xs: 1, sm: 3 },
            ...cardBg(theme),
            minHeight: { xs: '70vh', sm: '75vh' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            {location.pathname === '/admin' ? (
              <Box>
                {/* Welcome Banner */}
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 4,
                  mt: { xs: 1, sm: 2 },
                }}>
                  <EmojiEventsIcon sx={{ fontSize: 60, color: theme.palette.mode === 'light' ? '#283593' : 'primary.main', mb: 1 }} />
                  <Typography variant="h3" align="center" sx={{ fontWeight: 800, color: theme.palette.mode === 'light' ? '#1a237e' : 'text.primary', mb: 1, textTransform: 'none', letterSpacing: 1 }}>
                    Καλωσήρθες στο Admin Panel
                  </Typography>
                  <Typography variant="subtitle1" align="center" sx={{ color: theme.palette.mode === 'light' ? '#283593' : 'text.secondary', opacity: 0.8, textTransform: 'none', mb: 1 }}>
                    Εδώ διαχειρίζεσαι τα πάντα για την Τράπεζα Θεμάτων DSUth
                  </Typography>
                </Box>
                {/* Metrics */}
                <Grid container spacing={3} justifyContent="center" sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: 4, boxShadow: 4, p: 3, textAlign: 'center', background: theme.palette.mode === 'light' ? 'linear-gradient(135deg, #e3eafc 0%, #f4f6f8 100%)' : 'background.paper', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { boxShadow: 8, transform: 'scale(1.04)' } }}>
                      <PeopleIcon sx={{ fontSize: 38, color: '#1976d2', mb: 1 }} />
                      <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'none', fontWeight: 600 }}>Συνολικοί Χρήστες</Typography>
                      <Typography variant="h4" color="primary" fontWeight={800}>
                        {metricsLoading ? '...' : userCount}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: 4, boxShadow: 4, p: 3, textAlign: 'center', background: theme.palette.mode === 'light' ? 'linear-gradient(135deg, #fff4e5 0%, #fff8e1 100%)' : 'background.paper', border: theme.palette.mode === 'light' ? '1px solid #ffe0b2' : '1px solid rgba(255, 152, 0, 0.3)', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { boxShadow: 8, transform: 'scale(1.04)' } }}>
                      <HourglassEmptyIcon sx={{ fontSize: 38, color: theme.palette.mode === 'light' ? '#f57c00' : '#ffb74d', mb: 1 }} />
                      <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'none', fontWeight: 600 }}>Εκκρεμή Αρχεία</Typography>
                      <Typography variant="h4" sx={{ color: theme.palette.mode === 'light' ? '#f57c00' : '#ffb74d', fontWeight: 800 }}>
                        {metricsLoading ? '...' : pendingFilesCount}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: 4, boxShadow: 4, p: 3, textAlign: 'center', background: theme.palette.mode === 'light' ? 'linear-gradient(135deg, #ffebee 0%, #fce4ec 100%)' : 'background.paper', border: theme.palette.mode === 'light' ? '1px solid #ffcdd2' : '1px solid rgba(244, 67, 54, 0.3)', transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { boxShadow: 8, transform: 'scale(1.04)' } }}>
                      <AssignmentLateIcon sx={{ fontSize: 38, color: theme.palette.mode === 'light' ? '#d32f2f' : '#e57373', mb: 1 }} />
                      <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'none', fontWeight: 600 }}>Ανοιχτά Αιτήματα</Typography>
                      <Typography variant="h4" sx={{ color: theme.palette.mode === 'light' ? '#d32f2f' : '#e57373', fontWeight: 800 }}>
                        {metricsLoading ? '...' : openRequestsCount}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
                {/* Επιλογές Admin */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
                    gap: 4,
                    gridAutoRows: '1fr',
                    width: '100%',
                    mb: 2,
                  }}
                >
                  {adminMenu.map((item) => (
                    <Box key={item.text} sx={{ display: 'flex', height: '100%', px: { xs: 4, sm: 0 } }}>
                      <Card sx={{
                        borderRadius: 4,
                        boxShadow: 6,
                        background: theme.palette.mode === 'light' ? 'linear-gradient(135deg, #e3eafc 0%, #f4f6f8 100%)' : 'background.paper',
                        transition: 'transform 0.18s, box-shadow 0.18s',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flex: 1,
                        '&:hover': {
                          boxShadow: 12,
                          transform: 'translateY(-6px) scale(1.045)',
                          background: theme.palette.mode === 'light' ? 'linear-gradient(135deg, #e8eaf6 0%, #f4f6f8 100%)' : 'rgba(255,255,255,0.05)',
                        },
                      }}>
                        <CardActionArea onClick={() => navigate(item.path)} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center', width: '100%' }}>
                          {React.cloneElement(item.icon, { sx: { fontSize: 40, color: theme.palette.mode === 'light' ? '#283593' : 'primary.main', mb: 1 } })}
                          <CardContent sx={{ p: 0 }}>
                            <Typography variant="h6" align="center" sx={{ fontWeight: 700, textTransform: 'none', fontSize: 16, whiteSpace: 'normal', wordBreak: 'break-word', textAlign: 'center', width: '100%', m: 0, color: theme.palette.mode === 'light' ? '#1a237e' : 'text.primary' }}>
                              {item.text}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(-1)}
                  sx={{ mb: 2, alignSelf: 'flex-start', fontWeight: 600, textTransform: 'none' }}
                >
                  Πίσω
                </Button>
                <Outlet />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </AdminSidebarContext.Provider>
  );
};

export default AdminDashboard; 