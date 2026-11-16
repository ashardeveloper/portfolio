"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/admin/actions";

const groups = [
  { label: "", items: [{ href: "/admin", label: "Dashboard" }] },
  {
    label: "Content",
    items: [
      { href: "/admin/hero", label: "Hero and profile" },
      { href: "/admin/about", label: "About" },
      { href: "/admin/skills", label: "Skills" },
      { href: "/admin/experience", label: "Experience" },
      { href: "/admin/education", label: "Education" },
      { href: "/admin/certifications", label: "Certifications" },
      { href: "/admin/projects", label: "Projects" },
    ],
  },
  { label: "Site", items: [{ href: "/admin/sections", label: "Section headings" }] },
];

export function AdminNav({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-5 backdrop-blur-xl lg:hidden">
        <p className="font-display font-semibold">
          <span className="text-gradient">{siteName}</span> <span className="text-faint">admin</span>
        </p>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="admin-nav"
          className="rounded-md border border-line px-3 py-1.5 text-sm"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <aside
        id="admin-nav"
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-line bg-surface pt-14 lg:flex lg:pt-0 ${open ? "flex" : "hidden"}`}
      >
        <div className="hidden h-16 items-center border-b border-line px-5 lg:flex">
          <p className="font-display text-lg font-semibold">
            <span className="text-gradient">{siteName}</span> <span className="text-sm font-normal text-faint">admin</span>
          </p>
        </div>

        <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((g) => (
            <div key={g.label || "top"} className="mb-4">
              {g.label && <p className="mb-1.5 px-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-faint">{g.label}</p>}
              <ul className="space-y-0.5">
                {g.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive(item.href) ? "bg-violet/15 font-medium text-ink" : "text-muted hover:bg-white/5 hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="space-y-1 border-t border-line p-3">
          <a href="/" target="_blank" rel="noreferrer" className="block rounded-lg px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-ink">
            View site ↗
          </a>
          <form action={logout}>
            <button type="submit" className="w-full rounded-lg px-3 py-2 text-left text-sm text-muted hover:bg-white/5 hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
