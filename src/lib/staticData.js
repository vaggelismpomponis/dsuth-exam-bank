/**
 * staticData.js — Falls back to pre-generated static JSON files when available.
 *
 * During exam seasons we run `node scripts/prebuild-static-data.js` which
 * writes snapshots to /public/data/. These are deployed as static Vercel CDN
 * assets and served with zero Supabase egress cost.
 *
 * This module provides a transparent wrapper: it tries to load from /data/*.json
 * first (instant, free, CDN-cached). If the file is missing or stale (older than
 * MAX_STATIC_AGE_MS), it falls back to the live Supabase query transparently.
 *
 * Usage:
 *   import { withStaticFallback } from '../lib/staticData';
 *
 *   const courses = await withStaticFallback(
 *     '/data/courses.json',
 *     () => supabase.from('courses').select('*')...
 *   );
 *
 * How staleness works:
 *   - Each pre-generated file is accompanied by /data/manifest.json which
 *     contains the `generatedAt` timestamp.
 *   - If the snapshot is older than MAX_STATIC_AGE_MS, we fall back to live data.
 *   - During exam season this threshold is relaxed (24h → 48h) since data
 *     changes even less frequently.
 */

import { isExamSeason } from './queryCache.js';

/** Max age of static snapshots before falling back to live data. */
const MAX_STATIC_AGE_MS_DEFAULT = 7 * 24 * 60 * 60 * 1000;   // 7 days
const MAX_STATIC_AGE_MS_EXAM    = 2 * 24 * 60 * 60 * 1000;   // 2 days during exam season (new files appear faster)

function maxStaticAge() {
  return isExamSeason() ? MAX_STATIC_AGE_MS_EXAM : MAX_STATIC_AGE_MS_DEFAULT;
}

// Cached manifest so we only fetch it once per page load
let _manifestPromise = null;
let _manifestFetched = false;
let _manifestAge = null; // age in ms at fetch time, or null if unavailable

async function getManifestAge() {
  if (_manifestFetched) return _manifestAge;
  _manifestFetched = true;
  try {
    const res = await fetch('/data/manifest.json', { cache: 'no-store' });
    if (!res.ok) { _manifestAge = null; return null; }
    const manifest = await res.json();
    if (!manifest?.generatedAt) { _manifestAge = null; return null; }
    _manifestAge = Date.now() - new Date(manifest.generatedAt).getTime();
    return _manifestAge;
  } catch {
    _manifestAge = null;
    return null;
  }
}

/**
 * Tries to load data from a pre-generated static JSON file.
 * If unavailable or stale, calls the provided `liveFn` instead.
 *
 * @param {string}   staticPath  - Path relative to public root, e.g. '/data/courses.json'
 * @param {Function} liveFn      - Async function that returns live data from Supabase.
 * @returns {Promise<any>}
 */
export async function withStaticFallback(staticPath, liveFn) {
  try {
    // Check manifest staleness once (shared across all calls this page load)
    const age = await getManifestAge();

    // If manifest is missing, no static data available → use live
    if (age === null) return liveFn();

    // If static data is too old → use live (to avoid serving very stale exam lists)
    if (age > maxStaticAge()) {
      if (import.meta.env.DEV) {
        console.info(`[staticData] ${staticPath} → stale (${Math.round(age / 3600000)}h old), using live query`);
      }
      return liveFn();
    }

    // Attempt to fetch the static file
    const res = await fetch(staticPath, {
      // Allow browser cache for static files (they have Vercel's CDN headers)
      cache: 'force-cache',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (import.meta.env.DEV) {
      console.info(`[staticData] ${staticPath} → HIT (${Math.round(age / 3600000)}h old)`);
    }

    return data;
  } catch (err) {
    // Any failure (network, parse error, etc.) → silently fall back to live
    if (import.meta.env.DEV) {
      console.warn(`[staticData] ${staticPath} → MISS (${err.message}), falling back to live`);
    }
    return liveFn();
  }
}

/**
 * Convenience: check if pre-generated static data is available and fresh.
 * Useful to conditionally show a "data as of X" badge in the UI.
 *
 * @returns {Promise<{ available: boolean; generatedAt: string|null; ageMinutes: number|null }>}
 */
export async function getStaticDataInfo() {
  try {
    const res = await fetch('/data/manifest.json', { cache: 'no-store' });
    if (!res.ok) return { available: false, generatedAt: null, ageMinutes: null };
    const manifest = await res.json();
    const ageMs = Date.now() - new Date(manifest.generatedAt).getTime();
    const isFresh = ageMs < maxStaticAge();
    return {
      available: isFresh,
      generatedAt: manifest.generatedAt,
      ageMinutes: Math.round(ageMs / 60000),
    };
  } catch {
    return { available: false, generatedAt: null, ageMinutes: null };
  }
}
