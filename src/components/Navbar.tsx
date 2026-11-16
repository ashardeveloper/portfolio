"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Profile } from "@/lib/schema";
import { CloseIcon, DownloadIcon, MenuIcon } from "./Icons";

const links = [
  { href: "/#about", label: "About" },
  { href: "/#skills", label: "Skills" },
  { href: "/#experience", label: "Experience" },
  { href: "/#projects", label: "Projects" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar({ profile }: { profile: Pick<Profile, "name" | "initials" | "cv"> }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,border-color] duration-300 ${
        scrolled || open ? "border-b border-line bg-bg/80 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-[76rem] items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          aria-label={`${profile.name} — home`}
          className="font-display text-lg font-bold tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="text-gradient">{profile.initials}</span>
          <span className="text-faint">.</span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="group relative py-2 text-sm text-muted transition-colors hover:text-ink"
              >
                {l.label}
                <span className="bg-accent absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={profile.cv}
            download
            className="hidden items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-2 text-sm font-medium transition-colors hover:border-violet/60 hover:bg-violet/10 sm:inline-flex"
          >
            <DownloadIcon width={15} height={15} />
            Download CV
          </a>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-line md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden md:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 pb-5">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base text-muted hover:bg-white/5 hover:text-ink"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={profile.cv}
                  download
                  className="bg-accent mt-2 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-bg"
                >
                  <DownloadIcon width={15} height={15} />
                  Download CV
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
