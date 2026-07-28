import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// Deliberately narrow: flyers/screenshots (images, PDF) and CRM-export-style
// data (CSV, plain text). Anything else is rejected outright, not sniffed
// or coerced.
const ALLOWED_CONTENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/csv",
  "text/plain",
]);

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data body." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Provide a 'file' field." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: `File is too large (max ${MAX_SIZE_BYTES / (1024 * 1024)}MB).` },
      { status: 400 }
    );
  }

  const contentType = file.type;
  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    return NextResponse.json(
      {
        error: `Unsupported file type "${contentType || "unknown"}". Accepted: images (PNG/JPEG/WEBP/GIF), PDF, CSV, or plain text.`,
      },
      { status: 400 }
    );
  }

  const blob = await put(file.name, file, {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });

  return NextResponse.json({
    url: blob.url,
    pathname: blob.pathname,
    contentType,
    filename: file.name,
    size: file.size,
  });
}
