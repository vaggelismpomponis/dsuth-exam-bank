import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { getSemesterTheme } from './semesterTheme';

export const SemesterDistributionBar = ({ courses, activeSem, onSelectSem }) => {
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const semStats = semesters.map((sem) => {
    const semCourses = courses.filter((c) => Number(c.semester) === sem);
    const theme = getSemesterTheme(sem);
    return {
      sem,
      count: semCourses.length,
      theme,
    };
  });

  const total = courses.length || 1;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'text.secondary',
          }}
        >
          Κατανομή Προγράμματος Σπουδών
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {courses.length} Μαθήματα σε 8 Εξάμηνα
        </Typography>
      </Box>

      {/* Proportional distribution bar */}
      <Box
        sx={{
          height: 10,
          width: '100%',
          display: 'flex',
          borderRadius: '4px',
          overflow: 'hidden',
          bgcolor: 'action.hover',
          gap: '2px',
          mb: 2,
        }}
      >
        {semStats.map(({ sem, count, theme }) => {
          const pct = ((count / total) * 100).toFixed(1);
          const isSelected = activeSem === null || activeSem === sem;
          return (
            <Box
              key={sem}
              onClick={() => onSelectSem(activeSem === sem ? null : sem)}
              title={`${theme.label}: ${count} μαθήματα (${pct}%)`}
              sx={{
                width: `${pct}%`,
                height: '100%',
                bgcolor: theme.color,
                opacity: isSelected ? 1 : 0.25,
                cursor: 'pointer',
                transition: 'opacity 0.2s ease, transform 0.15s ease',
                '&:hover': { opacity: 0.9, transform: 'scaleY(1.3)' },
              }}
            />
          );
        })}
      </Box>

      {/* Segment legend buttons */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(4, 1fr)', sm: 'repeat(8, 1fr)' },
          gap: 1,
        }}
      >
        {semStats.map(({ sem, count, theme }) => {
          const isActive = activeSem === sem;
          return (
            <Box
              key={sem}
              onClick={() => onSelectSem(isActive ? null : sem)}
              sx={{
                p: 1,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isActive ? theme.color : 'divider',
                bgcolor: isActive ? `${theme.color}14` : 'background.default',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: theme.color,
                  bgcolor: `${theme.color}0a`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: theme.color }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}>
                  {sem}ο
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 600 }}>
                {count} μαθ.
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

