/**
 * api/upload.js — Vercel Serverless Function
 *
 * Handles file uploads from the browser to Cloudflare R2.
 * Secret R2 credentials stay server-side and are never exposed to the client.
 *
 * Flow:
 *   1. Browser POSTs multipart/form-data with the file + metadata
 *   2. This function uploads to R2 using the S3-compatible API
 *   3. Returns the public R2 URL to the browser
 *   4. Browser then inserts the exam record into Supabase DB with the R2 URL
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

export const config = { api: { bodyParser: false } };

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.VITE_R2_PUBLIC_URL;

/** Parse multipart/form-data manually using the Web Streams API (Vercel Edge-compatible) */
async function parseMultipart(req) {
  const contentType = req.headers['content-type'] || '';
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) throw new Error('No boundary found in Content-Type');
  const boundary = boundaryMatch[1];

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = Buffer.concat(chunks);

  const parts = {};
  const delimiter = Buffer.from(`--${boundary}`);
  let start = body.indexOf(delimiter) + delimiter.length + 2; // skip \r\n

  while (start < body.length) {
    const end = body.indexOf(delimiter, start);
    if (end === -1) break;

    const part = body.slice(start, end - 2); // trim trailing \r\n
    const headerEnd = part.indexOf('\r\n\r\n');
    const headerRaw = part.slice(0, headerEnd).toString();
    const data = part.slice(headerEnd + 4);

    const nameMatch = headerRaw.match(/name="([^"]+)"/);
    const filenameMatch = headerRaw.match(/filename="([^"]+)"/);
    const ctMatch = headerRaw.match(/Content-Type: (.+)/);

    if (nameMatch) {
      const name = nameMatch[1];
      if (filenameMatch) {
        parts[name] = {
          filename: filenameMatch[1],
          contentType: ctMatch ? ctMatch[1].trim() : 'application/octet-stream',
          data,
        };
      } else {
        parts[name] = data.toString().trim();
      }
    }

    start = end + delimiter.length + 2;
  }

  return parts;
}

/** Check if a key already exists in R2 */
async function keyExists(key) {
  try {
    const res = await r2.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: key,
      MaxKeys: 1,
    }));
    return (res.Contents || []).some(obj => obj.Key === key);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const parts = await parseMultipart(req);
    const fileField = parts.file;
    const filename = parts.filename;   // final filename sent from client

    if (!fileField || !filename) {
      return res.status(400).json({ error: 'Missing file or filename' });
    }

    let key = filename;

    // Handle collisions: append _1, _2 etc. if key already exists
    if (await keyExists(key)) {
      const ext = key.includes('.') ? key.split('.').pop() : '';
      const base = ext ? key.slice(0, -(ext.length + 1)) : key;
      let counter = 1;
      while (await keyExists(`${base}_${counter}${ext ? '.' + ext : ''}`)) {
        counter++;
      }
      key = `${base}_${counter}${ext ? '.' + ext : ''}`;
    }

    await r2.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileField.data,
      ContentType: fileField.contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }));

    const publicUrl = `${PUBLIC_URL}/${key}`;
    return res.status(200).json({ url: publicUrl, key });

  } catch (err) {
    console.error('[upload] Error:', err);
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
}
