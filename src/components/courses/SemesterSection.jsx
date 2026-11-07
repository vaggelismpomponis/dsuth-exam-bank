import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { CourseCard } from './CourseCard';
import { getSemesterTheme } from './semesterTheme';

export const SemesterSection = ({
  semester,
  courses,
  examCounts,
  favorites,
  onToggleFavorite,
  onFilterSemester,
  isSingleSemesterView = false,
}) => {
  const theme = getSemesterTheme(semester);

  const totalFiles = courses.reduce((sum, c) => sum + (examCounts[c.name] || 0), 0);

  return (
    <Box component="section" aria-label={theme.label} sx={{ mb: 6 }}>
      {/* Section Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          pb: 2,
          mb: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography
            component="span"
            sx={{
              display: 'block',
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: theme.color,
              mb: 0.5,
            }}
          >
            {theme.year}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: theme.color }} />
            <Typography variant="h2" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
              {theme.label}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                bgcolor: 'action.selected',
                px: 1,
                py: 0.25,
                borderRadius: '6px',
              }}
            >
              {courses.length} {courses.length === 1 ? 'μάθημα' : 'μαθήματα'} • {totalFiles} {totalFiles === 1 ? 'αρχείο' : 'αρχεία'}
            </Typography>
          </Box>
        </Box>

        {!isSingleSemesterView && onFilterSemester && (
          <Button
            size="small"
            variant="text"
            onClick={() => onFilterSemester(semester)}
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'text.secondary',
              borderRadius: '8px',
              px: 1.5,
              '&:hover': { color: theme.color, bgcolor: `${theme.color}0a` },
            }}
          >
            Εστίαση στο {semester}ο Εξάμηνο →
          </Button>
        )}
      </Box>

      {/* Courses Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 2.5,
        }}
      >
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            fileCount={examCounts[course.name] || 0}
            isFavorite={favorites.includes(course.id)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </Box>
    </Box>
  );
};

