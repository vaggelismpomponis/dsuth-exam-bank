import React from 'react';
import { Box, Fab } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PostAddIcon from '@mui/icons-material/PostAdd';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { label: 'Αρχική', icon: <HomeIcon />, path: '/' },
    { label: 'Μαθήματα', icon: <SearchIcon />, path: '/courses' },
    { label: null, icon: null, path: null }, // FAB spacer
    { label: 'Αγαπημένα', icon: <FavoriteIcon />, path: '/favorites' },
    { label: 'Φοιτητές', icon: <GroupIcon />, path: '/students' },
];

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();

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
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
                /* extend white background into safe area */
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
        >
            <Box
                sx={{
                    height: 72,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    px: 0.5,
                    position: 'relative',
                }}
            >
                {navItems.map((item, idx) => {
                    if (!item.path) {
                        return (
                            <Box key={idx} sx={{ width: 60, display: 'flex', justifyContent: 'center', position: 'relative' }}>
                                <Fab
                                    aria-label="upload"
                                    onClick={() => navigate('/upload')}
                                    sx={{
                                        position: 'absolute',
                                        top: -32,
                                        width: 52,
                                        height: 52,
                                        bgcolor: 'primary.main',
                                        color: '#fff',
                                        boxShadow: '0 4px 14px rgba(26,115,232,0.35)',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        '&:active': { bgcolor: 'primary.dark' },
                                    }}
                                >
                                    <AddIcon sx={{ fontSize: 26 }} />
                                </Fab>
                            </Box>
                        );
                    }

                    const active = isActive(item.path);
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
                                color: active ? 'primary.main' : 'text.secondary',
                                transition: 'color 0.15s',
                                '& svg': {
                                    fontSize: 24,
                                    transition: 'transform 0.15s',
                                },
                                '&:active svg': {
                                    transform: 'scale(0.9)',
                                },
                            }}
                        >
                            {item.icon}
                            <Box
                                component="span"
                                sx={{
                                    fontSize: '0.68rem',
                                    fontWeight: active ? 700 : 500,
                                    mt: 0.5,
                                    fontFamily: "'Inter', sans-serif",
                                    lineHeight: 1,
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
