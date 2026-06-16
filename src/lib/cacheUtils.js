/**
 * cacheUtils.js
 *
 * Clears all app-level caches and performs a hard reload so the user
 * always gets fresh data from Supabase instead of stale cached entries.
 *
 * This is called when a file fails to load (404) — the likely cause is
 * stale static JSON data (public/data/exams-*.json) or stale sessionStorage
 * cache that still references old R2 URLs that no longer exist.
 */

/**
 * Wipes every 'sqcache:' key from sessionStorage (our queryCache layer 2).
 */
function clearSessionCache() {
  try {
    const toRemove = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('sqcache:')) toRemove.push(key);
    }
    toRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch (_) {
    // sessionStorage may be unavailable (private mode) — ignore
  }
}

/**
 * Deletes all entries in the Workbox / SW runtime caches that match
 * the static data pattern (/data/*.json). This forces the SW to
 * re-fetch from the network on the next request.
 */
async function clearSwDataCache() {
  if (!('caches' in window)) return;
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        await Promise.all(
          requests
            .filter((req) => req.url.includes('/data/') && req.url.endsWith('.json'))
            .map((req) => cache.delete(req))
        );
      })
    );
  } catch (_) {
    // Cache API errors are non-fatal
  }
}

/**
 * Full cache purge + hard reload.
 *
 * Call this when the user clicks "Ανανέωση" after a file-load failure so
 * they get a completely fresh page with up-to-date file lists.
 */
export async function clearCacheAndReload() {
  clearSessionCache();
  await clearSwDataCache();
  // Hard reload bypasses the browser's HTTP cache for the page itself
  window.location.reload();
}
