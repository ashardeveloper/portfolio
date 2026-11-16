import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { getAdminContent, storageStatus } from "@/lib/content";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin" },
  robots: { index: false, follow: false },
};

// Admin pages always reflect what is saved right now.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const { profile } = await getAdminContent();
  const storage = storageStatus();

  return (
    <div className="min-h-screen">
      <AdminNav siteName={profile.initials} />
      <div className="lg:pl-64">
        {storage.error && (
          <p role="alert" className="border-b border-todo/30 bg-todo/10 px-5 py-3 text-sm text-todo sm:px-8">
            The database cannot be reached, so this page may show older content and saving will fail. Check the
            database settings (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) and reload.
          </p>
        )}
        {storage.readOnly && (
          <p role="alert" className="border-b border-todo/30 bg-todo/10 px-5 py-3 text-sm text-todo sm:px-8">
            This deployment cannot save files, so changes made here will not be kept. Edit on your own computer, then
            commit and redeploy.
          </p>
        )}
        <main className="mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
