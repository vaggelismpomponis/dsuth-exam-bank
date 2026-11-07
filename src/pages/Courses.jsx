import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { useCoursesData } from '../components/courses/useCoursesData';
import { CoursesHero } from '../components/courses/CoursesHero';
import { CoursesSemesterFilter } from '../components/courses/CoursesSemesterFilter';
import { SemesterDistributionBar } from '../components/courses/SemesterDistributionBar';
import { SemesterSection } from '../components/courses/SemesterSection';

const Courses = () => {
  const { courses, loading, examCounts, favorites, toggleFavorite } = useCoursesData();
  const [search, setSearch] = useState('');
  const [activeSem, setActiveSem] = useState(null);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course?.name ? course.name.toLowerCase().includes(search.toLowerCase()) : false;
      const matchesSem = activeSem === null || Number(course.semester) === Number(activeSem);
      return matchesSearch && matchesSem;
    });
  }, [courses, search, activeSem]);

  const groupedSemesters = useMemo(() => {
    const semesters = activeSem !== null ? [activeSem] : [1, 2, 3, 4, 5, 6, 7, 8];
    return semesters
      .map((sem) => ({
        semester: sem,
        courses: filteredCourses.filter((c) => Number(c.semester) === sem),
      }))
      .filter((g) => g.courses.length > 0);
  }, [filteredCourses, activeSem]);

  const totalFiles = useMemo(() => {
    return Object.values(examCounts).reduce((a, b) => a + b, 0);
  }, [examCounts]);

  return (
    <Box component="main" sx={{ width: '100%', minHeight: '100dvh', bgcolor: 'background.default', pb: { xs: 10, md: 6 } }}>
      <CoursesHero
        coursesCount={courses.length}
        filesCount={totalFiles}
        search={search}
        onSearchChange={setSearch}
      />

      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 4, md: 6 }, pt: { xs: 3, md: 4 } }}>
        <Box sx={{ mb: 2.5 }}>
          <CoursesSemesterFilter activeSem={activeSem} onSelectSem={setActiveSem} courses={courses} />
        </Box>

        <SemesterDistributionBar courses={courses} activeSem={activeSem} onSelectSem={setActiveSem} />

        {loading && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: '12px' }} />
            ))}
          </Box>
        )}

        {!loading && groupedSemesters.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: '12px',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
              Δεν βρέθηκαν μαθήματα
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Δοκιμάστε διαφορετικό όρο αναζήτησης ή επιλέξτε άλλο εξάμηνο.
            </Typography>
          </Box>
        )}

        {!loading && groupedSemesters.map((group) => (
          <SemesterSection
            key={group.semester}
            semester={group.semester}
            courses={group.courses}
            examCounts={examCounts}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onFilterSemester={setActiveSem}
            isSingleSemesterView={activeSem !== null}
          />
        ))}
      </Container>
    </Box>
  );
};

export default Courses;
