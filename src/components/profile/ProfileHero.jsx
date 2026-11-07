import React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Camera, Trash2, ShieldCheck, User } from 'lucide-react';

export const ProfileHero = ({
  user,
  displayName,
  initials,
  currentAvatarUrl,
  isAdmin,
  uploadingAvatar,
  avatarMenuAnchor,
  setAvatarMenuAnchor,
  fileInputRef,
  handleAvatarUpload,
  handleAvatarRemove,
}) => {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        pt: { xs: 4, md: 5 },
        pb: { xs: 4, md: 5 },
        px: 2,
        textAlign: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <IconButton
              onClick={(e) => setAvatarMenuAnchor(e.currentTarget)}
              disabled={uploadingAvatar}
              aria-label="Επιλογές εικόνας προφίλ"
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover' },
                width: 34,
                height: 34,
                color: 'text.primary',
              }}
            >
              {uploadingAvatar ? (
                <CircularProgress size={16} />
              ) : (
                <Camera size={16} />
              )}
            </IconButton>
          }
        >
          <Avatar
            src={currentAvatarUrl}
            alt={displayName}
            sx={{
              width: 88,
              height: 88,
              bgcolor: 'primary.main',
              color: '#fff',
              fontSize: 32,
              fontWeight: 800,
              border: '2px solid',
              borderColor: 'divider',
            }}
          >
            {!currentAvatarUrl && initials}
          </Avatar>
        </Badge>

        <Menu
          anchorEl={avatarMenuAnchor}
          open={Boolean(avatarMenuAnchor)}
          onClose={() => setAvatarMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{ sx: { borderRadius: '8px', mt: 0.5 } }}
        >
          <MenuItem onClick={() => fileInputRef.current?.click()} sx={{ gap: 1.5, fontSize: '0.875rem' }}>
            <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
              <Camera size={16} />
            </Box>
            Μεταφόρτωση νέας εικόνας
          </MenuItem>
          {currentAvatarUrl && (
            <MenuItem onClick={handleAvatarRemove} sx={{ color: 'error.main', gap: 1.5, fontSize: '0.875rem' }}>
              <Box sx={{ color: 'error.main', display: 'flex', alignItems: 'center' }}>
                <Trash2 size={16} />
              </Box>
              Αφαίρεση εικόνας
            </MenuItem>
          )}
        </Menu>
        <input type="file" accept="image/*" hidden ref={fileInputRef} onChange={handleAvatarUpload} />

        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mt: 2, letterSpacing: '-0.02em' }}>
          {displayName}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 0.5 }}>
          {user.email}
        </Typography>

        <Chip
          icon={isAdmin
            ? <ShieldCheck size={14} style={{ color: 'inherit' }} />
            : <User size={14} style={{ color: 'inherit' }} />
          }
          label={isAdmin ? 'Διαχειριστής (Admin)' : 'Φοιτητής'}
          size="small"
          sx={{
            mt: 1.5,
            fontWeight: 700,
            fontSize: '0.75rem',
            borderRadius: '6px',
            bgcolor: 'action.selected',
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
          }}
        />
      </Container>
    </Box>
  );
};
