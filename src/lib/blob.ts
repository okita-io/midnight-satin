/**
 * Midnight Satin Blob Storage Layer
 * Vercel Blob for image assets (Req 11.1, 11.5)
 * Novel covers, Character portraits, Author avatars stored with public read access
 */

import { put, del } from "@vercel/blob";

/** Allowed image content types for uploads */
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageType = (typeof ALLOWED_CONTENT_TYPES)[number];

export interface UploadImageOptions {
  /** Path prefix (e.g. "covers", "portraits", "avatars") */
  prefix: string;
  /** Original filename for extension (e.g. "cover.jpg") */
  filename: string;
  /** Content type - must be image/* */
  contentType?: AllowedImageType;
}

/**
 * Upload an image to Vercel Blob.
 * Returns the public URL for database reference.
 * Used by MCP and Admin Dashboard (Req 11.5).
 */
export async function uploadImage(
  body: Blob | ArrayBuffer | string,
  options: UploadImageOptions
): Promise<{ url: string }> {
  const ext = options.filename.split(".").pop() || "jpg";
  const pathname = `${options.prefix}/${crypto.randomUUID()}.${ext}`;

  const result = await put(pathname, body, {
    access: "public",
    contentType: options.contentType || "image/jpeg",
  });

  return { url: result.url };
}

/**
 * Delete a blob by URL or pathname.
 * Used when replacing or removing assets.
 */
export async function deleteBlob(urlOrPathname: string): Promise<void> {
  await del(urlOrPathname);
}
