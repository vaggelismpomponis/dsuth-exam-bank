import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { cachedQuery } from '../../lib/queryCache';
import { withStaticFallback } from '../../lib/staticData';

export const useCoursesData = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examCounts, setExamCounts] = useState({});
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [coursesData, examsRaw] = await Promise.all([
          cachedQuery(
            'courses:list',
            () => withStaticFallback(
              '/data/courses.json',
              async () => {
                const { data, error } = await supabase
                  .from('courses')
                  .select('id, name, semester')
                  .order('semester', { ascending: true })
                  .order('name', { ascending: true });
                if (error) {
                  console.error('Supabase courses query failed:', error);
                  throw error;
                }
                return data ?? [];
              }
            ),
            10 * 60 * 1000
          ),
          cachedQuery(
            'exams:counts',
            () => withStaticFallback(
              '/data/exams-counts.json',
              async () => {
                const { data } = await supabase
                  .from('exams')
                  .select('course, id')
                  .eq('approved', true);
                return data ?? [];
              }
            ),
            5 * 60 * 1000
          ),
        ]);

        setCourses(coursesData || []);

        let counts;
        if (Array.isArray(examsRaw)) {
          counts = {};
          examsRaw.forEach((e) => {
            counts[e.course] = (counts[e.course] || 0) + 1;
          });
        } else {
          counts = examsRaw || {};
        }
        setExamCounts(counts);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('favorites')
      .select('course_id')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (!error && data) setFavorites(data.map((f) => f.course_id));
      });
  }, [user]);

  const toggleFavorite = useCallback(async (courseId) => {
    if (!user) return;
    if (favorites.includes(courseId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('course_id', courseId);
      setFavorites((prev) => prev.filter((id) => id !== courseId));
    } else {
      await supabase.from('favorites').insert([{ user_id: user.id, course_id: courseId }]);
      setFavorites((prev) => [...prev, courseId]);
    }
  }, [user, favorites]);

  return { courses, loading, examCounts, user, favorites, toggleFavorite };
};

