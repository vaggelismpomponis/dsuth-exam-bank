import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export const NavDesktopLinks = ({ links, moreLinks = [] }) => {
  const [moreAnchor, setMoreAnchor] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isMoreOpen = Boolean(moreAnchor);

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  const isMoreActive = moreLinks.some((item) => isActive(item.to));

  const handleMoreClick = (e) => {
    setMoreAnchor(e.currentTarget);
  };

  const handleMoreClose = () => {
    setMoreAnchor(null);
  };

  const handleSelectSubItem = (to) => {
    handleMoreClose();
    navigate(to);
  };

  return (
    <Box
      component="nav"
      aria-label="Κύρια πλοήγηση"
      sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: { md: 0.35, lg: 0.5 } }}
    >
      {links.map((link) => {
        const active = isActive(link.to);
        return (
          <Box
            key={link.to}
            component={Link}
            to={link.to}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { md: 0.5, lg: 0.75 },
              px: { md: 1, lg: 1.35 },
              py: 0.85,
              borderRadius: '8px',
              fontSize: { md: '0.8125rem', lg: '0.875rem' },
              fontWeight: active ? 700 : 500,
              color: active ? 'primary.main' : 'text.secondary',
              bgcolor: active ? 'action.selected' : 'transparent',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              '&:hover': {
                color: 'text.primary',
                bgcolor: 'action.hover',
                textDecoration: 'none',
              },
            }}
          >
            {React.isValidElement(link.icon) && (
              <Box component="span" sx={{ display: { md: 'none', lg: 'inline-flex' }, alignItems: 'center' }}>
                {React.cloneElement(link.icon, {
                  size: 16,
                  strokeWidth: 2,
                  className: 'shrink-0',
                })}
              </Box>
            )}
            <span>{link.label}</span>
          </Box>
        );
      })}

      {moreLinks.length > 0 && (
        <>
          <Button
            size="small"
            onClick={handleMoreClick}
            endIcon={
              <ChevronDown
                size={15}
                style={{
                  transform: isMoreOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease',
                }}
              />
            }
            sx={{
              px: 1.5,
              py: 0.85,
              minHeight: 'auto',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: isMoreActive ? 700 : 500,
              color: isMoreActive ? 'primary.main' : 'text.secondary',
              bgcolor: isMoreActive ? 'action.selected' : 'transparent',
              textTransform: 'none',
              '&:hover': {
                color: 'text.primary',
                bgcolor: 'action.hover',
              },
            }}
          >
            Περισσότερα
          </Button>

          <Menu
            anchorEl={moreAnchor}
            open={isMoreOpen}
            onClose={handleMoreClose}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: '12px',
                  minWidth: 200,
                  mt: 0.75,
                  p: 0.75,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 'none',
                  bgcolor: 'background.paper',
                },
              },
            }}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            disableScrollLock
          >
            {moreLinks.map((subItem) => {
              const active = isActive(subItem.to);
              return (
                <MenuItem
                  key={subItem.to}
                  onClick={() => handleSelectSubItem(subItem.to)}
                  sx={{
                    borderRadius: '8px',
                    py: 1,
                    px: 1.5,
                    gap: 1.25,
                    bgcolor: active ? 'action.selected' : 'transparent',
                    color: active ? 'primary.main' : 'text.primary',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  {React.isValidElement(subItem.icon)
                    ? React.cloneElement(subItem.icon, {
                        size: 18,
                        strokeWidth: 2,
                        className: 'shrink-0',
                      })
                    : subItem.icon}
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: active ? 700 : 500 }}>
                    {subItem.label}
                  </Typography>
                </MenuItem>
              );
            })}
          </Menu>
        </>
      )}
    </Box>
  );
};
