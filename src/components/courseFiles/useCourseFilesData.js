import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { cachedQuery, invalidateCacheByPrefix } from '../../lib/queryCache';
import { withStaticFallback } from '../../lib/staticData';
import { isUserAdmin } from '../../utils/adminUtils';

export const useCourseFilesData = (courseId) => {
  const [course, setCourse] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        const adminStatus = await isUserAdmin(currentUser.id);
        setIsAdmin(adminStatus);
      }
    });
  }, []);

  const loadData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError('');

    try {
      const courseData = await cachedQuery(
        `course:${courseId}`,
        () => withStaticFallback(
          '/data/courses.json',
          async () => {
            const { data, error } = await supabase.from('courses').select('id, name, semester').eq('id', courseId).single();
            if (error) throw error;
            return data ?? null;
          },
          (all) => all?.find((c) => String(c.id) === String(courseId)) ?? null
        ),
        10 * 60 * 1000
      );

      if (!courseData) {
        setError('Το μάθημα δεν βρέθηκε.');
        setLoading(false);
        return;
      }
      setCourse(courseData);

      const filesData = await cachedQuery(
        isAdmin ? null : `exams:course:${courseId}`,
        isAdmin
          ? async () => {
              const { data, error: qErr } = await supabase
                .from('exams')
                .select('id, course, year, period, file_url, approved, created_at, uploader')
                .eq('course', courseData.name)
                .order('year', { ascending: false });
              if (qErr) throw qErr;
              return data ?? [];
            }
          : () => withStaticFallback(
              `/data/exams-${courseId}.json`,
              async () => {
                const { data, error: qErr } = await supabase
                  .from('exams')
                  .select('id, course, year, period, file_url, approved, created_at, uploader')
                  .eq('course', courseData.name)
                  .eq('approved', true)
                  .order('year', { ascending: false });
                if (qErr) throw qErr;
                return data ?? [];
              }
            ),
        5 * 60 * 1000
      );

      setFiles(filesData || []);
    } catch (err) {
      setError(err?.message || 'Αποτυχία ανάκτησης αρχείων.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const approveFile = async (fileId) => {
    const { error: err } = await supabase.from('exams').update({ approved: true }).eq('id', fileId);
    if (err) {
      setError('Σφάλμα έγκρισης: ' + err.message);
    } else {
      setSuccess('Το αρχείο εγκρίθηκε!');
      setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, approved: true } : f)));
      invalidateCacheByPrefix('exams:');
    }
  };

  const deleteFile = async (fileId, filePath) => {
    if (filePath) {
      await supabase.storage.from('exams').remove([filePath]);
    }
    const { error: err } = await supabase.from('exams').delete().eq('id', fileId);
    if (err) {
      setError('Σφάλμα διαγραφής: ' + err.message);
    } else {
      setSuccess('Το αρχείο διαγράφηκε.');
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      invalidateCacheByPrefix('exams:');
    }
  };

  return { course, files, loading, user, isAdmin, error, success, setError, setSuccess, approveFile, deleteFile, refetch: loadData };
};

