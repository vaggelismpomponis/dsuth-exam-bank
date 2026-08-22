/**
 * api/presign.js - Vercel Serverless Function
 *
 * Returns a short-lived presigned PUT URL so the browser can upload
 * directly to Cloudflare R2 without routing the file body through Vercel.
 *
 * This bypasses Vercel's 4.5 MB body limit entirely - files go straight
 * from the browser to R2.
 *
 * Flow:
 *   1. Browser calls POST /api/presign  { filename, contentType }
 *   2. This function checks for key collisions in R2, then generates
 *      a presigned PUT URL valid for 5 minutes.
 *   3. Browser PUTs the file directly to R2 using that URL.
 *   4. Browser inserts the exam record into Supabase DB with the public R2 URL.
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const config = { api: { bodyParser: true } };

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.VITE_R2_PUBLIC_URL;

/** Check if a key already exists in R2 */
async function keyExists(key) {
  try {
    const res = await r2.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: key,
      MaxKeys: 1,
    }));
    return (res.Contents || []).some((obj) => obj.Key === key);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { filename, contentType } = req.body || {};
    if (!filename || !contentType) {
      return res.status(400).json({ error: "Missing filename or contentType" });
    }

    // Sanitize: only allow safe characters in filenames
    const safeFilename = filename.replace(/[^a-zA-Z0-9._\-]/g, "_");

    // Handle key collisions: append _1, _2 etc. if key already exists
    let key = safeFilename;
    if (await keyExists(key)) {
      const ext = key.includes(".") ? key.split(".").pop() : "";
      const base = ext ? key.slice(0, -(ext.length + 1)) : key;
      let counter = 1;
      while (await keyExists(`${base}_${counter}${ext ? "." + ext : ""}`)) {
        counter++;
      }
      key = `${base}_${counter}${ext ? "." + ext : ""}`;
    }

    // Generate a presigned PUT URL valid for 5 minutes
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    });

    const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 300 });
    const publicUrl = `${PUBLIC_URL}/${key}`;

    return res.status(200).json({ presignedUrl, publicUrl, key });
  } catch (err) {
    console.error("[presign] Error:", err);
    return res.status(500).json({ error: err.message || "Failed to generate upload URL" });
  }
}
