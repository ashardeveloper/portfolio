import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  const configured = adminConfigured();

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5 py-12">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_45%_at_50%_0%,rgb(139_92_246/0.22),transparent_70%)]"
      />
      <div className="w-full max-w-sm">
        <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-cyan">Portfolio admin</p>
        <h1 className="mt-3 text-center font-display text-3xl font-bold tracking-tight">Sign in</h1>

        <div className="glass mt-8 rounded-2xl p-6">
          {configured ? (
            <LoginForm />
          ) : (
            <div className="space-y-3 text-sm leading-relaxed text-muted">
              <p className="font-medium text-todo">The admin is not set up yet.</p>
              <p>
                Add these two lines to a file named <code className="font-mono text-ink">.env.local</code> in the project
                folder, then restart the server:
              </p>
              <pre className="overflow-x-auto rounded-lg border border-line bg-bg p-3 font-mono text-xs text-ink">
                {"ADMIN_PASSWORD=at-least-8-characters\nADMIN_SESSION_SECRET=at-least-32-random-characters"}
              </pre>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-muted hover:text-ink">
            ← Back to the site
          </Link>
        </p>
      </div>
    </main>
  );
}
