import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { getSemesterTheme } from './semesterTheme';

export const CoursesSemesterFilter = ({ activeSem, onSelectSem, courses = [] }) => {
  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const getCount = (sem) => {
    return courses.filter((c) => Number(c.semester) === sem).length;
  };

  return (
    <Box
      sx={{
        display: { xs: 'grid', md: 'flex' },
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'none' },
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1,
        pb: 1,
        pt: 0.5,
      }}
    >
      <Button
        size="small"
        variant={activeSem === null ? 'contained' : 'outlined'}
        color={activeSem === null ? 'primary' : 'inherit'}
        onClick={() => onSelectSem(null)}
        sx={{
          gridColumn: { xs: '1 / -1', md: 'auto' },
          width: { xs: '100%', md: 'auto' },
          borderRadius: '8px',
          fontWeight: 700,
          fontSize: '0.8125rem',
          minHeight: 36,
          px: 1.75,
          border: '1px solid',
          borderColor: activeSem === null ? 'primary.main' : 'divider',
          bgcolor: activeSem === null ? 'primary.main' : 'background.paper',
          color: activeSem === null ? '#fff' : 'text.secondary',
          '&:hover': {
            bgcolor: activeSem === null ? 'primary.dark' : 'action.hover',
            borderColor: activeSem === null ? 'primary.dark' : 'text.secondary',
          },
        }}
      >
        Όλα τα Εξάμηνα ({courses.length})
      </Button>

      {semesters.map((sem) => {
        const isActive = activeSem === sem;
        const theme = getSemesterTheme(sem);
        const count = getCount(sem);

        return (
          <Button
            key={sem}
            size="small"
            variant={isActive ? 'contained' : 'outlined'}
            onClick={() => onSelectSem(sem)}
            sx={{
              width: { xs: '100%', md: 'auto' },
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.8125rem',
              minHeight: 36,
              px: 1.5,
              border: '1px solid',
              borderColor: isActive ? theme.color : 'divider',
              bgcolor: isActive ? theme.color : 'background.paper',
              color: isActive ? '#fff' : 'text.secondary',
              '&:hover': {
                bgcolor: isActive ? theme.color : 'action.hover',
                borderColor: isActive ? theme.color : 'text.secondary',
              },
            }}
          >
            {sem}ο Εξάμηνο ({count})
          </Button>
        );
      })}
    </Box>
  );
};
