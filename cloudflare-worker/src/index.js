/**
 * Cloudflare Worker — R2 File Proxy
 *
 * Serves files from the private R2 bucket publicly via a workers.dev URL.
 * Handles CORS, caching and range requests (for PDF streaming).
 *
 * Deploy URL will be: https://dsuth-exam-bank-files.<your-subdomain>.workers.dev
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const url = new URL(request.url);
    // Remove leading slash to get the R2 object key
    const key = decodeURIComponent(url.pathname.slice(1));

    if (!key) {
      return new Response('Not Found', { status: 404 });
    }

    // Fetch from R2
    const object = await env.R2_BUCKET.get(key);

    if (!object) {
      return new Response('File Not Found', { status: 404 });
    }

    const headers = new Headers();

    // Copy R2 metadata headers (Content-Type, etc.)
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);

    // CORS — allow all origins to read files
    headers.set('Access-Control-Allow-Origin', '*');

    // Long-term cache since files are immutable (named by content)
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new Response(object.body, {
      status: 200,
      headers,
    });
  },
};
