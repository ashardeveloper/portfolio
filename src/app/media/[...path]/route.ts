import { readUpload } from "@/lib/uploads";

export const runtime = "nodejs";

/** Serves files uploaded through the admin, from the database or from data/uploads. */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const key = (await params).path.join("/");

  let file: Awaited<ReturnType<typeof readUpload>>;
  try {
    // readUpload rejects anything that is not "<folder>/<name>.<known extension>".
    file = await readUpload(key);
  } catch {
    return new Response("Storage unavailable", { status: 503 });
  }
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(file.data.byteLength),
      // File names carry a random suffix, so they can be cached indefinitely.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
