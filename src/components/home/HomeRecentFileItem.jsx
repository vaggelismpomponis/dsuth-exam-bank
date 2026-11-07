import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import { FileText, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { normalizeFileUrl } from '../../lib/urlNormalizer';

export const HomeRecentFileItem = ({ exam }) => {
  const navigate = useNavigate();

  const handleOpenViewer = () => {
    const url = normalizeFileUrl(exam.file_url) || '';
    const filename = url.split('/').pop().split('?')[0];
    const params = new URLSearchParams({
      url,
      name: filename,
      course: exam.courses?.name || exam.course || '',
      period: exam.period || '',
      year: String(exam.year || ''),
    });
    navigate(`/viewer?${params.toString()}`);
  };

  return (
    <Paper
      component="article"
      onClick={handleOpenViewer}
      sx={{
        p: { xs: 2, sm: 2.25 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '12px',
        bgcolor: 'background.paper',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', shrink: 0 }}>
          <FileText size={20} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9375rem', mb: 0.5 }}
          >
            {exam.course || 'Άγνωστο Μάθημα'}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            {exam.year && (
              <Chip
                label={exam.year}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  bgcolor: 'action.selected',
                  color: 'text.secondary',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )}
            {exam.period && (
              <Chip
                label={exam.period}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  bgcolor: 'action.hover',
                  color: 'primary.main',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )}
          </Stack>
        </Box>
      </Stack>

      <IconButton
        size="small"
        aria-label={`Προβολή αρχείου ${exam.course || ''}`}
        onClick={(e) => {
          e.stopPropagation();
          handleOpenViewer();
        }}
        sx={{
          ml: 1.5,
          color: 'text.secondary',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
        }}
      >
        <Eye size={17} />
      </IconButton>
    </Paper>
  );
};

