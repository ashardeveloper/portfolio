import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { saveUpload } from "@/lib/uploads";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

/** Allowed types, checked against the file's leading bytes rather than its claimed type. */
const TYPES: { ext: string; kind: "image" | "document"; test: (b: Buffer) => boolean }[] = [
  { ext: "png", kind: "image", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: "jpg", kind: "image", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "webp", kind: "image", test: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  { ext: "gif", kind: "image", test: (b) => b.toString("ascii", 0, 4) === "GIF8" },
  { ext: "avif", kind: "image", test: (b) => b.toString("ascii", 4, 12) === "ftypavif" },
  { ext: "pdf", kind: "document", test: (b) => b.toString("ascii", 0, 5) === "%PDF-" },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "file";

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(request: Request) {
  if (!(await isAdmin())) return bad("Not signed in.", 401);

  // Same-origin only: blocks cross-site form posts riding on the session cookie.
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || new URL(origin).host !== host) return bad("Cross-site request blocked.", 403);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return bad("Could not read the upload.");
  }

  const file = form.get("file");
  if (!(file instanceof File)) return bad("No file received.");
  if (file.size === 0) return bad("The file is empty.");
  if (file.size > MAX_BYTES) return bad("The file is larger than 8 MB.");

  const accept = String(form.get("accept") ?? "image");
  const bytes = Buffer.from(await file.arrayBuffer());
  const type = TYPES.find((t) => t.test(bytes));
  if (!type || type.kind !== accept) {
    return bad(accept === "document" ? "Please upload a PDF." : "Please upload a PNG, JPG, WebP, GIF or AVIF image.");
  }

  const folder = slugify(String(form.get("folder") ?? "general"));
  const name = `${slugify(file.name)}-${randomUUID().slice(0, 6)}.${type.ext}`;

  try {
    await saveUpload(`${folder}/${name}`, bytes);
  } catch (e) {
    console.error("[upload] save failed:", e instanceof Error ? e.message : e);
    return bad("The upload could not be saved. Check the storage settings and try again.", 500);
  }

  return NextResponse.json({ src: `/media/${folder}/${name}` });
}
