import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { RowDataPacket } from "mysql2";
import { UPLOAD_DIR } from "./content";
import { db, dbConfigured } from "./db";

export const UPLOAD_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  avif: "image/avif",
  pdf: "application/pdf",
};

/** Upload keys are always "<folder>/<name>.<ext>" in lowercase, which also rules out path traversal. */
const KEY = /^[a-z0-9-]{1,60}\/[a-z0-9-]{1,80}\.([a-z0-9]{2,5})$/;

export function uploadMime(key: string): string | undefined {
  const match = KEY.exec(key);
  return match ? UPLOAD_MIME[match[1]] : undefined;
}

export async function saveUpload(key: string, bytes: Buffer): Promise<void> {
  const mime = uploadMime(key);
  if (!mime) throw new Error("Invalid upload name.");

  if (dbConfigured()) {
    const pool = await db();
    await pool.query("INSERT INTO portfolio_uploads (path, mime, size, data) VALUES (?, ?, ?, ?)", [
      key,
      mime,
      bytes.byteLength,
      bytes,
    ]);
    return;
  }
  const file = path.join(UPLOAD_DIR, key);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, bytes);
}

export async function readUpload(key: string): Promise<{ mime: string; data: Buffer } | null> {
  const mime = uploadMime(key);
  if (!mime) return null;

  if (dbConfigured()) {
    const pool = await db();
    const [rows] = await pool.query<RowDataPacket[]>("SELECT mime, data FROM portfolio_uploads WHERE path = ?", [key]);
    return rows.length ? { mime: rows[0].mime, data: rows[0].data as Buffer } : null;
  }
  try {
    return { mime, data: await fs.readFile(path.join(UPLOAD_DIR, key)) };
  } catch {
    return null;
  }
}
