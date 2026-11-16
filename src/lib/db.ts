import "server-only";

import mysql, { type Pool } from "mysql2/promise";

/** The database is used when these are set; otherwise content lives in the data/ folder. */
export const dbConfigured = () =>
  Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);

// Kept on globalThis so dev-mode reloads reuse one pool instead of leaking connections.
const store = globalThis as typeof globalThis & {
  __portfolioPool?: Pool;
  __portfolioTables?: Promise<void>;
};

function pool(): Pool {
  store.__portfolioPool ??= mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME,
    charset: "utf8mb4",
    connectionLimit: 5,
    connectTimeout: 10_000,
    enableKeepAlive: true,
  });
  return store.__portfolioPool;
}

async function createTables(db: Pool) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS portfolio_content (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY,
      data LONGTEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS portfolio_uploads (
      path VARCHAR(191) NOT NULL PRIMARY KEY,
      mime VARCHAR(64) NOT NULL,
      size INT UNSIGNED NOT NULL,
      data MEDIUMBLOB NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
}

/** Returns the pool once the tables exist. A failed setup is retried on the next call. */
export async function db(): Promise<Pool> {
  const p = pool();
  store.__portfolioTables ??= createTables(p).catch((e) => {
    store.__portfolioTables = undefined;
    throw e;
  });
  await store.__portfolioTables;
  return p;
}
