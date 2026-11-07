import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { Heart, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSemesterTheme } from './semesterTheme';

export const CourseCard = ({ course, fileCount = 0, isFavorite = false, onToggleFavorite }) => {
  const navigate = useNavigate();
  const semTheme = getSemesterTheme(course.semester);
  const hasFiles = fileCount > 0;

  return (
    <Paper
      component="article"
      onClick={() => navigate(`/courses/${course.id}`)}
      sx={{
        p: { xs: 2.25, sm: 2.5 },
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        '&:hover': {
          borderColor: semTheme.color,
          bgcolor: 'action.hover',
          transform: 'translateY(-1px)',
        },
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: semTheme.color }} />
            <Typography
              component="span"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: semTheme.color,
              }}
            >
              {semTheme.label}
            </Typography>
          </Box>

          {onToggleFavorite && (
            <IconButton
              size="small"
              aria-label={isFavorite ? 'Αφαίρεση από αγαπημένα' : 'Προσθήκη στα αγαπημένα'}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(course.id);
              }}
              sx={{ color: isFavorite ? 'error.main' : 'text.secondary', p: 0.5 }}
            >
              <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
            </IconButton>
          )}
        </Box>

        <Typography
          component="h3"
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            fontSize: '1rem',
            lineHeight: 1.35,
            mb: 1.5,
          }}
        >
          {course.name}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Chip
          icon={
            <FileText
              size={13}
              style={{
                flexShrink: 0,
                color: hasFiles ? semTheme.color : 'inherit',
              }}
            />
          }
          label={`${fileCount} ${fileCount === 1 ? 'αρχείο' : 'αρχεία'}`}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.75rem',
            fontWeight: hasFiles ? 700 : 500,
            borderRadius: '6px',
            bgcolor: hasFiles
              ? (theme) =>
                  theme.palette.mode === 'dark'
                    ? `${semTheme.color}25`
                    : `${semTheme.color}14`
              : 'action.selected',
            color: hasFiles ? semTheme.color : 'text.secondary',
            border: '1px solid',
            borderColor: hasFiles
              ? (theme) =>
                  theme.palette.mode === 'dark'
                    ? `${semTheme.color}45`
                    : `${semTheme.color}30`
              : 'transparent',
            transition: 'all 0.15s ease',
            '& .MuiChip-label': { px: 0.75 },
            '& .MuiChip-icon': {
              color: hasFiles ? semTheme.color : 'inherit',
              ml: 0.75,
              mr: -0.25,
            },
          }}
        />

        <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={16} />
        </Box>
      </Box>
    </Paper>
  );
};
