import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { FileText, Eye, Download, Share2, Trash2, CheckCircle2 } from 'lucide-react';

export const CourseFileItem = ({
  file,
  courseName,
  isAdmin = false,
  onPreview,
  onDownload,
  onShare,
  onApprove,
  onDelete,
}) => {
  return (
    <Paper
      component="article"
      role="button"
      tabIndex={0}
      onClick={() => onPreview(file)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPreview(file);
        }
      }}
      sx={{
        p: { xs: 2, sm: 2.25 },
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 2,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: 'action.hover',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0, flex: 1 }}>
        <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', shrink: 0 }}>
          <FileText size={22} />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}>
              {file.year ? `Έτος ${file.year}` : 'Θέμα Εξέτασης'}
            </Typography>

            {file.period && (
              <Chip
                label={file.period}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  bgcolor: 'action.selected',
                  color: 'primary.main',
                  '& .MuiChip-label': { px: 0.75 },
                }}
              />
            )}

            {!file.approved && (
              <Chip
                label="Εκκρεμεί Έγκριση"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  bgcolor: 'warning.light',
                  color: 'warning.dark',
                }}
              />
            )}
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {courseName}
          </Typography>
        </Box>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        onClick={(e) => e.stopPropagation()}
        sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}
      >
        <Tooltip title="Προβολή">
          <IconButton
            size="small"
            aria-label="Προβολή αρχείου"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(file);
            }}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', width: 34, height: 34, color: 'text.secondary' }}
          >
            <Eye size={17} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Λήψη">
          <IconButton
            size="small"
            aria-label="Λήψη αρχείου"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(file);
            }}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', width: 34, height: 34, color: 'text.secondary' }}
          >
            <Download size={17} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Κοινοποίηση">
          <IconButton
            size="small"
            aria-label="Κοινοποίηση αρχείου"
            onClick={(e) => {
              e.stopPropagation();
              onShare(file);
            }}
            sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', width: 34, height: 34, color: 'text.secondary' }}
          >
            <Share2 size={17} />
          </IconButton>
        </Tooltip>

        {isAdmin && !file.approved && (
          <Tooltip title="Έγκριση">
            <IconButton
              size="small"
              color="success"
              aria-label="Έγκριση αρχείου"
              onClick={(e) => {
                e.stopPropagation();
                onApprove(file.id);
              }}
              sx={{ border: '1px solid', borderColor: 'success.main', borderRadius: '8px', width: 34, height: 34 }}
            >
              <CheckCircle2 size={17} />
            </IconButton>
          </Tooltip>
        )}

        {isAdmin && (
          <Tooltip title="Διαγραφή">
            <IconButton
              size="small"
              color="error"
              aria-label="Διαγραφή αρχείου"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file);
              }}
              sx={{ border: '1px solid', borderColor: 'error.main', borderRadius: '8px', width: 34, height: 34 }}
            >
              <Trash2 size={17} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Paper>
  );
};
