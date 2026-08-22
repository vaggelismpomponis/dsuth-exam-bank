/**
 * urlNormalizer.js
 *
 * Transparently rewrites legacy Supabase storage URLs and direct R2 public
 * bucket URLs to the current Cloudflare Worker proxy URL.
 *
 * Legacy format 1 (Supabase Storage):
 *   https://<project>.supabase.co/storage/v1/object/public/exams/<filename>
 *
 * Legacy format 2 (direct R2 public bucket – disabled):
 *   https://pub-4362ca1444014ebdbcbe319423b57914.r2.dev/<filename>
 *
 * Current format (Cloudflare Worker proxy):
 *   https://dsuth-exam-bank-files.dsuth-exams-uth.workers.dev/<filename>
 *
 * This normalizer is applied to every file_url read from the database, cache,
 * or static JSON files, so even users with stale cached data automatically
 * get working URLs without needing to clear their cache manually.
 */

const SUPABASE_STORAGE_PATTERN = /^https?:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/public\/[^/]+\//;

// Matches the direct R2 public bucket URL (r2.dev subdomain – public access disabled)
const R2_DIRECT_PATTERN = /^https?:\/\/[^/]+\.r2\.dev\//;

const R2_BASE_URL = import.meta.env.VITE_R2_PUBLIC_URL || 'https://dsuth-exam-bank-files.dsuth-exams-uth.workers.dev';

/**
 * Rewrites legacy Supabase Storage URLs and direct R2 public-bucket URLs
 * to the Cloudflare Worker proxy URL.
 * URLs that are already pointing at the Worker are returned unchanged.
 *
 * @param {string} url - The raw file_url from the database or cache.
 * @returns {string} - The normalised URL pointing to the Worker proxy.
 */
export function normalizeFileUrl(url) {
  if (!url || typeof url !== 'string') return url;

  // Strip trailing ? or whitespace that sometimes leaks in
  const clean = url.trim().replace(/\?$/, '');

  if (SUPABASE_STORAGE_PATTERN.test(clean) || R2_DIRECT_PATTERN.test(clean)) {
    // Extract just the filename (last path segment, before any query string)
    const filename = clean.split('/').pop().split('?')[0];
    return `${R2_BASE_URL}/${filename}`;
  }

  return clean;
}
