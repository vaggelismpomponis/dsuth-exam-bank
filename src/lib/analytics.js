import { supabase } from '../supabaseClient';

/**
 * Retrieves the persistent visitor ID from localStorage, or generates
 * and stores a new one if it doesn't exist.
 * This allows tracking unique active users anonymously.
 */
export const getOrCreateVisitorId = () => {
  try {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      // Standard UUID v4 generation fallback
      if (crypto && crypto.randomUUID) {
        visitorId = crypto.randomUUID();
      } else {
        visitorId = 'v-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now().toString(36);
      }
      localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
  } catch (e) {
    console.warn('[Analytics] Failed to access localStorage:', e);
    return 'anonymous-session';
  }
};

/**
 * Asynchronously logs an event to the analytics_events database table.
 * Resolves user_id, visitor_id, page path, and optional foreign keys.
 * 
 * @param {string} eventType - e.g. 'page_view', 'download', 'preview', 'upload'
 * @param {object} metadata - Extra event details (e.g. courseId, examId, filename)
 */
export const trackEvent = async (eventType, metadata = {}) => {
  try {
    // 1. Get auth details if available
    const { data } = await supabase.auth.getSession();
    const userId = data?.session?.user?.id || null;

    // 2. Get local parameters
    const visitorId = getOrCreateVisitorId();
    const pagePath = window.location.pathname;

    // 3. Extract common foreign keys
    const courseId = metadata.courseId || null;
    const examId = metadata.examId || null;

    // Clean metadata to avoid repeating courseId/examId in JSONB payload
    const cleanMetadata = { ...metadata };
    delete cleanMetadata.courseId;
    delete cleanMetadata.examId;

    // 4. Non-blocking async insert
    supabase
      .from('analytics_events')
      .insert([
        {
          event_type: eventType,
          page_path: pagePath,
          visitor_id: visitorId,
          course_id: courseId,
          exam_id: examId,
          user_id: userId,
          metadata: Object.keys(cleanMetadata).length > 0 ? cleanMetadata : null
        }
      ])
      .then(({ error }) => {
        if (error) {
          console.warn('[Analytics LOG ERROR]', error.message);
        }
      });
  } catch (err) {
    console.warn('[Analytics FAILED]', err);
  }
};
