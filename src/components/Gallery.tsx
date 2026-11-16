"use client";

import Image from "next/image";
import { isUpload } from "@/lib/site";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Shot } from "@/lib/schema";
import { ArrowLeft, ArrowRight, CloseIcon } from "./Icons";

export function Gallery({ shots, title }: { shots: Shot[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setActive(null);
    lastTrigger.current?.focus();
  }, []);
  const step = useCallback(
    (d: number) => setActive((i) => (i === null ? i : (i + d + shots.length) % shots.length)),
    [shots.length],
  );

  useEffect(() => {
    if (active === null) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [active === null, close, step]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = active === null ? null : shots[active];

  return (
    <>
      <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>li]:mb-5">
        {shots.map((s, i) => (
          <li key={s.src} className="break-inside-avoid">
            <button
              type="button"
              onClick={(e) => {
                lastTrigger.current = e.currentTarget;
                setActive(i);
              }}
              className="group block w-full overflow-hidden rounded-2xl border border-line bg-raised text-left transition-colors hover:border-violet/50"
              aria-label={`Open screenshot: ${s.caption}`}
            >
              <span className="block overflow-hidden">
                <Image
                  src={s.src}
                  unoptimized={isUpload(s.src)}
                  alt={`${title} — ${s.caption}`}
                  width={s.width}
                  height={s.height}
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </span>
              <span className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="text-ink/90">{s.caption}</span>
                <span className="font-mono text-xs text-faint">
                  {String(i + 1).padStart(2, "0")}/{String(shots.length).padStart(2, "0")}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {current && active !== null && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={`${title} screenshot: ${current.caption}`}
                className="fixed inset-0 z-[90] flex flex-col bg-bg/95 backdrop-blur-md"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={close}
                data-lenis-prevent
              >
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <p className="text-sm">
                    <span className="font-medium">{current.caption}</span>
                    <span className="ml-3 font-mono text-xs text-faint">
                      {active + 1} / {shots.length}
                    </span>
                  </p>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={close}
                    aria-label="Close screenshot"
                    className="grid size-11 place-items-center rounded-full border border-line bg-white/5 hover:bg-white/10"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="relative min-h-0 flex-1">
                  <motion.div
                    key={current.src}
                    className="absolute inset-x-4 bottom-6 top-0 sm:inset-x-20"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Image
                      src={current.src}
                      unoptimized={isUpload(current.src)}
                      alt={`${title} — ${current.caption}`}
                      fill
                      sizes="100vw"
                      className="object-contain"
                    />
                  </motion.div>

                  {shots.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous screenshot"
                        onClick={(e) => {
                          e.stopPropagation();
                          step(-1);
                        }}
                        className="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-bg/80 hover:bg-white/10 sm:left-4"
                      >
                        <ArrowLeft />
                      </button>
                      <button
                        type="button"
                        aria-label="Next screenshot"
                        onClick={(e) => {
                          e.stopPropagation();
                          step(1);
                        }}
                        className="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-bg/80 hover:bg-white/10 sm:right-4"
                      >
                        <ArrowRight />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
