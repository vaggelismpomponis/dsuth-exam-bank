import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { cachedQuery } from '../../lib/queryCache';
import { withStaticFallback } from '../../lib/staticData';

export const useHomeExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cachedQuery(
        'home:recent-exams',
        () => withStaticFallback(
          '/data/recent-exams.json',
          async () => {
            const { data: records, error: queryError } = await supabase
              .from('exams')
              .select('id, course, year, period, file_url, created_at')
              .eq('approved', true)
              .order('created_at', { ascending: false })
              .limit(6);

            if (queryError) throw queryError;
            return records ?? [];
          }
        ),
        5 * 60 * 1000
      );
      setExams(data || []);
    } catch (err) {
      setError(err?.message || 'Αποτυχία φόρτωσης αρχείων');
      setExams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  return { exams, loading, error, refetch: fetchExams };
};

