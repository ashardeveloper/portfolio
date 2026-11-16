import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const password = () => process.env.ADMIN_PASSWORD ?? "";
const secret = () => process.env.ADMIN_SESSION_SECRET ?? "";

/** Admin stays locked until both variables are set (see .env.example). */
export const adminConfigured = () => password().length >= 8 && secret().length >= 32;

const sign = (expires: number) => createHmac("sha256", secret()).update(`admin:${expires}`).digest("base64url");

const safeEqual = (a: string, b: string) => {
  // Hash first so both buffers have equal length and timing leaks nothing about the secret.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

export const checkPassword = (candidate: string) => adminConfigured() && safeEqual(candidate, password());

export async function createSession() {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE;
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.ADMIN_INSECURE_COOKIE !== "1",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [exp, sig] = value.split(".");
  const expires = Number(exp);
  if (!sig || !Number.isFinite(expires) || expires < Date.now() / 1000) return false;
  return safeEqual(sig, sign(expires));
}

/** For pages: sends anyone without a valid session to the login screen. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

/* ---- Login rate limiting (in memory, per IP) ---- */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const attempts = new Map<string, { count: number; resetAt: number }>();

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

/** Returns minutes to wait if the caller is locked out, otherwise 0. */
export function lockedFor(ip: string): number {
  const entry = attempts.get(ip);
  if (!entry) return 0;
  if (entry.resetAt < Date.now()) {
    attempts.delete(ip);
    return 0;
  }
  return entry.count >= MAX_ATTEMPTS ? Math.ceil((entry.resetAt - Date.now()) / 60000) : 0;
}

export function recordFailure(ip: string) {
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < Date.now()) attempts.set(ip, { count: 1, resetAt: Date.now() + WINDOW_MS });
  else entry.count += 1;
}

export const clearFailures = (ip: string) => attempts.delete(ip);
