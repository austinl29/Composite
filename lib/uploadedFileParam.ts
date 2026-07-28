import type { UploadedFileRef } from "@/lib/fileContext";

// Kept in sync with app/api/upload/route.ts's ALLOWED_CONTENT_TYPES.
const ALLOWED_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/csv",
  "text/plain",
]);

export type ParseFileResult =
  | { ok: true; file: UploadedFileRef | undefined }
  | { ok: false; error: string };

/**
 * Validates the optional `file` field on /api/followup-questions and
 * /api/synthesize request bodies. Critically, this restricts `file.url` to
 * our own Vercel Blob storage domain — without that check, a client could
 * hand the server (or, via the URL-source content block, the Claude API) an
 * arbitrary URL to fetch, which is an SSRF vector. Only a URL this app
 * itself produced via POST /api/upload is ever accepted.
 */
export function parseUploadedFileRef(raw: unknown): ParseFileResult {
  if (raw === undefined || raw === null) return { ok: true, file: undefined };

  if (typeof raw !== "object") {
    return { ok: false, error: "'file' must be an object if provided." };
  }
  const r = raw as Record<string, unknown>;
  const { url, contentType, filename } = r;

  if (typeof url !== "string" || url.trim().length === 0) {
    return { ok: false, error: "'file.url' must be a non-empty string." };
  }
  if (typeof contentType !== "string" || !ALLOWED_CONTENT_TYPES.has(contentType)) {
    return { ok: false, error: "'file.contentType' is missing or not an accepted type." };
  }
  if (typeof filename !== "string" || filename.trim().length === 0) {
    return { ok: false, error: "'file.filename' must be a non-empty string." };
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { ok: false, error: "'file.url' is not a valid URL." };
  }
  if (
    parsedUrl.protocol !== "https:" ||
    !parsedUrl.hostname.endsWith(".public.blob.vercel-storage.com")
  ) {
    return { ok: false, error: "'file.url' must be a URL from this app's blob storage." };
  }

  return { ok: true, file: { url, contentType, filename } };
}
