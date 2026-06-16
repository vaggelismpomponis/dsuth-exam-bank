/**
 * queryCache.js — Two-layer in-browser cache for public Supabase queries.
 *
 * Layer 1: module-level Map (survives React re-renders, lost on page reload)
 * Layer 2: sessionStorage (survives soft navigation / SPA route changes,
 *           lost when the tab is closed — appropriate for public exam data)
 *
 * Usage:
 *   import { cachedQuery, invalidateCache } from '../lib/queryCache';
 *
 *   const data = await cachedQuery('my-key', () => supabase.from(...), 5 * 60 * 1000);
 *   invalidateCache('my-key'); // call after mutations (upload, approve, delete)
 *
 * ── Exam-Season Mode ──────────────────────────────────────────────────────────
 * During peak traffic periods (exam seasons), data changes even less frequently
 * than usual (admins rarely upload mid-exam). We automatically detect these
 * windows and multiply all TTLs by EXAM_SEASON_MULTIPLIER (6×), so a 5-minute
 * cache becomes 30 minutes and a 10-minute cache becomes 60 minutes.
 *
 * Greek university exam seasons:
 *   • January / February   (winter exams)
 *   • May / June           (spring exams)
 *   • September            (resit exams)
 * ─────────────────────────────────────────────────────────────────────────────
 */

const memCache = new Map();

const SESSION_PREFIX = 'sqcache:';

/** Months (0-indexed) that are considered exam-season peak periods. */
const EXAM_SEASON_MONTHS = new Set([0, 1, 4, 5, 8]); // Jan, Feb, May, Jun, Sep

/** How much to multiply TTLs by during exam season (2× = 5 min → 10 min, 10 min → 20 min) */
const EXAM_SEASON_MULTIPLIER = 2;

/**
 * Returns true if today falls within a known exam-season peak window.
 * Result is memoized for the lifetime of the page (recalculates on reload).
 */
let _examSeasonCached = null;
export function isExamSeason() {
  if (_examSeasonCached !== null) return _examSeasonCached;
  const month = new Date().getMonth(); // 0 = January
  _examSeasonCached = EXAM_SEASON_MONTHS.has(month);
  return _examSeasonCached;
}

/**
 * Returns the effective TTL to use for a cache entry.
 * During exam season, TTLs are multiplied by EXAM_SEASON_MULTIPLIER.
 */
function effectiveTtl(baseTtlMs) {
  return isExamSeason() ? baseTtlMs * EXAM_SEASON_MULTIPLIER : baseTtlMs;
}

/**
 * Fetch data with TTL-based caching.
 *
 * @param {string|null} key      - Cache key. Pass null to always skip cache (e.g. admin paths).
 * @param {() => Promise<any>} queryFn - Async function that performs the actual Supabase query.
 * @param {number} ttlMs         - Time-to-live in milliseconds. Default: 5 minutes.
 * @returns {Promise<any>}       - Cached or freshly fetched data.
 */
export async function cachedQuery(key, queryFn, ttlMs = 5 * 60 * 1000) {
  // Bypass cache for null keys (admin views always need fresh data)
  if (!key) return queryFn();

  const now = Date.now();
  // Apply exam-season multiplier: during peak periods TTLs are 6× longer
  const ttl = effectiveTtl(ttlMs);

  // ── Layer 1: memory cache (fastest, zero serialization cost) ──
  if (memCache.has(key)) {
    const { data, ts } = memCache.get(key);
    if (now - ts < ttl) return data;
    memCache.delete(key); // expired
  }

  // ── Layer 2: sessionStorage (survives SPA navigation within the tab) ──
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key);
    if (raw) {
      const { data, ts } = JSON.parse(raw);
      if (now - ts < ttl) {
        memCache.set(key, { data, ts }); // warm the memory layer
        return data;
      }
      sessionStorage.removeItem(SESSION_PREFIX + key); // expired
    }
  } catch (_) {
    // sessionStorage may be unavailable in private browsing on some browsers — silently ignore
  }

  // ── Cache miss: run the real query ──
  const data = await queryFn();

  // Store in both layers
  memCache.set(key, { data, ts: now });
  try {
    sessionStorage.setItem(SESSION_PREFIX + key, JSON.stringify({ data, ts: now }));
  } catch (_) {
    // Quota exceeded or unavailable — memory cache still works
  }

  return data;
}

/**
 * Invalidate a cache entry immediately.
 * Call this after any write operation (upload, approve, delete) so the next
 * read gets fresh data instead of stale cached content.
 *
 * @param {string} key - Cache key to invalidate.
 */
export function invalidateCache(key) {
  memCache.delete(key);
  try {
    sessionStorage.removeItem(SESSION_PREFIX + key);
  } catch (_) {}
}

/**
 * Invalidate all cache entries whose key starts with a given prefix.
 * Useful for bulk invalidation, e.g. invalidateCacheByPrefix('exams:') after
 * an admin approves or deletes a file.
 *
 * @param {string} prefix
 */
export function invalidateCacheByPrefix(prefix) {
  // Memory cache
  for (const key of memCache.keys()) {
    if (key.startsWith(prefix)) memCache.delete(key);
  }
  // sessionStorage
  try {
    const keysToRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(SESSION_PREFIX + prefix)) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  } catch (_) {}
}
