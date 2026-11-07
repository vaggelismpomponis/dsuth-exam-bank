/**
 * Authentication utilities and helpers.
 */

/**
 * Resolves the callback redirect URL for Supabase Auth (OAuth and email verification).
 * Dynamically preserves the current window origin (e.g. http://localhost:5174 or https://dsuth-exam-bank.vercel.app).
 *
 * IMPORTANT: Supabase requires all redirect destinations to match an entry in:
 * Supabase Dashboard -> Authentication -> URL Configuration -> Redirect URLs.
 * If the current origin/port (such as http://localhost:5174) is not in that list,
 * Supabase silently redirects to the production "Site URL".
 *
 * @param {string} [path=''] - Optional target path after login (e.g. '/login' or '/').
 * @returns {string} Fully-qualified redirect URL.
 */
export const getAuthRedirectUrl = (path = '') => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    const origin = window.location.origin.replace(/\/+$/, '');
    if (!path || path === '/') {
      return `${origin}/`;
    }
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${origin}${cleanPath}`;
  }
  return 'https://dsuth-exam-bank.vercel.app/';
};

