import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import type { RowDataPacket } from "mysql2";
import { cache } from "react";
// Bundled into the build, so the starting content is available on hosts that do not ship the data/ folder.
import seed from "../../data/content.json";
import { db, dbConfigured } from "./db";
import { contentSchema, type Content } from "./schema";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "content.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

/** How long the public site may reuse content before asking the database again. */
const MEMO_MS = 30_000;
const store = globalThis as typeof globalThis & {
  __portfolioMemo?: { content: Content; at: number };
  __portfolioStorageError?: string;
};

async function readFromDb(): Promise<Content> {
  const pool = await db();
  const [rows] = await pool.query<RowDataPacket[]>("SELECT data FROM portfolio_content WHERE id = 1");
  if (rows.length) return contentSchema.parse(JSON.parse(rows[0].data));

  // First run against an empty database: start from the content shipped with the code.
  const initial = contentSchema.parse(seed);
  await pool.query("INSERT IGNORE INTO portfolio_content (id, data) VALUES (1, ?)", [JSON.stringify(initial)]);
  return initial;
}

async function readFromFile(): Promise<Content> {
  return contentSchema.parse(JSON.parse(await fs.readFile(FILE, "utf8")));
}

/** Reads straight from storage, so a save always starts from the latest saved state. Throws if storage fails. */
export async function readContentFresh(): Promise<Content> {
  const content = await (dbConfigured() ? readFromDb() : readFromFile());
  store.__portfolioStorageError = undefined;
  store.__portfolioMemo = { content, at: Date.now() };
  return content;
}

/**
 * Content for rendering pages. Deduplicated per request and reused for a short time.
 * If the database is unreachable the site stays up on the last known content.
 */
export const getContent = cache(async (): Promise<Content> => {
  if (!dbConfigured()) return readFromFile();

  const memo = store.__portfolioMemo;
  if (memo && Date.now() - memo.at < MEMO_MS) return memo.content;

  try {
    return await readContentFresh();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[content] database read failed:", message);
    store.__portfolioStorageError = message;
    // Keep serving the last known content and wait before trying the database again,
    // so an outage does not add a connection attempt to every page view.
    const content = memo?.content ?? contentSchema.parse(seed);
    store.__portfolioMemo = { content, at: Date.now() };
    return content;
  }
});

/** Content for the admin: always the latest saved state, never the short-lived copy the public site reuses. */
export const getAdminContent = cache(async (): Promise<Content> => {
  if (!dbConfigured()) return readFromFile();
  try {
    return await readContentFresh();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[content] database read failed:", message);
    store.__portfolioStorageError = message;
    return store.__portfolioMemo?.content ?? contentSchema.parse(seed);
  }
});

/** Validates, then saves. File mode writes atomically (temp file + rename) so a crash cannot corrupt the file. */
export async function writeContent(next: Content): Promise<void> {
  const valid = contentSchema.parse(next);

  if (dbConfigured()) {
    const pool = await db();
    await pool.query(
      "INSERT INTO portfolio_content (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)",
      [JSON.stringify(valid)],
    );
  } else {
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(valid, null, 2) + "\n", "utf8");
    await fs.rename(tmp, FILE);
  }
  store.__portfolioMemo = { content: valid, at: Date.now() };
}

/** What the admin shows about where content is stored. */
export function storageStatus(): { mode: "database" | "files"; readOnly: boolean; error?: string } {
  const database = dbConfigured();
  return {
    mode: database ? "database" : "files",
    // Hosts such as Vercel deploy a read-only filesystem, so file mode cannot save there.
    readOnly: !database && Boolean(process.env.VERCEL),
    error: database ? store.__portfolioStorageError : undefined,
  };
}

/** Published projects, flagship first-class. */
export function visibleProjects(content: Content) {
  return content.projects.filter((p) => p.published);
}
