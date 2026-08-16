/**
 * urlNormalizer.js
 *
 * Transparently rewrites legacy Supabase storage URLs to the current R2 CDN URL.
 *
 * Old format (Supabase Storage):
 *   https://<project>.supabase.co/storage/v1/object/public/exams/<filename>
 *
 * New format (Cloudflare R2):
 *   https://pub-4362ca1444014ebdbcbe319423b57914.r2.dev/<filename>
 *
 * This normalizer is applied to every file_url read from the database or cache,
 * so even users with stale cached data (sessionStorage / static JSON) automatically
 * get working URLs without needing to clear their cache manually.
 */

const SUPABASE_STORAGE_PATTERN = /^https?:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/[^/]+\//;

const R2_BASE_URL = import.meta.env.VITE_R2_PUBLIC_URL || 'https://dsuth-exam-bank-files.dsuth-exams-uth.workers.dev';

/**
 * Rewrites a legacy Supabase Storage URL to the R2 CDN URL.
 * If the URL is already an R2 URL (or any other URL), it is returned unchanged.
 *
 * @param {string} url - The raw file_url from the database or cache.
 * @returns {string} - The normalised URL pointing to R2.
 */
export function normalizeFileUrl(url) {
  if (!url || typeof url !== 'string') return url;

  // Strip trailing ? or whitespace that sometimes leaks in
  const clean = url.trim().replace(/\?$/, '');

  if (SUPABASE_STORAGE_PATTERN.test(clean)) {
    // Extract just the filename (last path segment, before any query string)
    const filename = clean.split('/').pop().split('?')[0];
    return `${R2_BASE_URL}/${filename}`;
  }

  return clean;
}
