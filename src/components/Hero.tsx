"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { isUpload } from "@/lib/site";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Profile } from "@/lib/schema";
import { ArrowRight, GitHubIcon, LinkedInIcon, MailIcon, PinIcon } from "./Icons";
import { EASE, Magnetic, useCan3D, useOnScreen } from "./motion";

const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/** Types and deletes each role in turn. */
function RotatingRole({ roles }: { roles: readonly string[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [text, setText] = useState(roles[0]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const full = roles[index];
    let delay = deleting ? 38 : 75;
    if (!deleting && text === full) delay = 1900;
    if (deleting && text === "") delay = 300;

    const t = setTimeout(() => {
      if (!deleting && text === full) setDeleting(true);
      else if (deleting && text === "") {
        setDeleting(false);
        setIndex((i) => (i + 1) % roles.length);
      } else {
        setText(deleting ? full.slice(0, text.length - 1) : full.slice(0, text.length + 1));
      }
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, index, roles, reduce]);

  return (
    <span aria-hidden className="font-mono text-base text-cyan sm:text-lg">
      <span className="text-faint">&gt; </span>
      {text}
      <span className="animate-blink ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[0.2em] bg-cyan" />
    </span>
  );
}

function Letters({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  return (
    <span aria-hidden className={className}>
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: "0.5em" }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: delay + i * 0.035, ease: EASE }}
        >
          {ch === " " ? " " : ch}
        </motion.span>
      ))}
    </span>
  );
}

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE },
});

export function Hero({ profile }: { profile: Profile }) {
  const can3D = useCan3D();
  const [ref, visible] = useOnScreen<HTMLElement>();
  const [first, ...rest] = profile.name.split(" ");

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-16">
      {/* Background: static gradient always; Three.js scene on capable desktops. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_75%_30%,rgb(139_92_246/0.22),transparent_70%),radial-gradient(50%_45%_at_15%_75%,rgb(34_211_238/0.14),transparent_70%)]" />
        <div className="grid-fade absolute inset-0" />
        {can3D && (
          <div className="absolute inset-0">
            <HeroScene active={visible} />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      </div>

      <div className="mx-auto grid w-full max-w-[76rem] items-center gap-12 px-5 py-14 md:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div className="order-2 lg:order-1">
          {profile.availability.enabled && (
          <motion.div {...fade(0.05)}>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-xs font-medium text-emerald-300 sm:text-sm">
              <span className="animate-pulse-dot size-2 rounded-full bg-emerald-400" />
              {profile.availability.badge}
              <span className="text-emerald-300/60">·</span>
              <span className="text-emerald-200/80">{profile.availability.short}</span>
            </span>
          </motion.div>
          )}

          <h1
            aria-label={`Hi, I'm ${profile.name}`}
            className="mt-6 font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          >
            <Letters text="Hi, I'm" delay={0.15} className="block text-2xl font-medium text-muted sm:text-3xl" />
            <Letters text={first} delay={0.4} className="mt-2 block" />
            {/* Animated as one block: gradient text cannot be clipped across per-letter layers. */}
            <motion.span
              aria-hidden
              className="text-gradient block pb-2"
              initial={{ opacity: 0, y: "0.4em" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
            >
              {rest.join(" ")}
            </motion.span>
          </h1>

          <motion.div {...fade(0.95)} className="mt-4">
            <p className="font-display text-xl font-semibold sm:text-2xl">{profile.role}</p>
            <div className="mt-2 h-7">
              <RotatingRole roles={profile.rotatingRoles} />
            </div>
          </motion.div>

          <motion.p {...fade(1.05)} className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {profile.tagline}
            <br />
            <span className="text-ink/90">{profile.focus}</span>
          </motion.p>

          <motion.div {...fade(1.15)} className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Link
                href="/#projects"
                className="bg-accent group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-bg shadow-[0_8px_30px_-8px_rgb(139_92_246/0.7)] transition-shadow hover:shadow-[0_10px_40px_-6px_rgb(34_211_238/0.7)]"
              >
                View Projects
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-6 py-3 text-sm font-semibold transition-colors hover:border-cyan/50 hover:bg-cyan/10"
              >
                <MailIcon />
                Contact Me
              </Link>
            </Magnetic>
            <div className="ml-1 flex items-center gap-2">
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub profile"
                className="grid size-11 place-items-center rounded-full border border-line text-muted transition-colors hover:border-violet/60 hover:text-ink"
              >
                <GitHubIcon />
              </a>
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn profile"
                className="grid size-11 place-items-center rounded-full border border-line text-muted transition-colors hover:border-violet/60 hover:text-ink"
              >
                <LinkedInIcon />
              </a>
            </div>
          </motion.div>

          <motion.ul {...fade(1.25)} className="mt-7 flex flex-wrap gap-2" aria-label="Location and languages">
            <li className="chip">
              <PinIcon width={13} height={13} />
              {profile.location}
            </li>
            {profile.languages.map((l) => (
              <li key={l.name} className="chip">
                {l.name} {l.level}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Photo */}
        <motion.div
          className="order-1 mx-auto w-[62%] max-w-[23rem] sm:w-[48%] lg:order-2 lg:w-full"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
        >
          <div className="relative aspect-square">
            <div aria-hidden className="bg-accent absolute -inset-6 rounded-full opacity-30 blur-3xl" />
            <div
              aria-hidden
              className="animate-spin-slow absolute -inset-[3px] rounded-full bg-[conic-gradient(from_0deg,#8b5cf6,#22d3ee,#8b5cf6_55%,transparent_75%,#8b5cf6)]"
            />
            <div className="absolute inset-0 overflow-hidden rounded-full border-4 border-bg bg-raised">
              {profile.photo && (
              <Image
                src={profile.photo}
                unoptimized={isUpload(profile.photo)}
                alt={`Portrait of ${profile.name}`}
                fill
                priority
                sizes="(min-width: 1024px) 368px, 60vw"
                className="object-cover object-[50%_30%]"
              />
              )}
            </div>
            {profile.photoBadge && (
            <div className="glass absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-2 font-mono text-[0.7rem] text-ink sm:text-xs lg:-left-6 lg:bottom-8 lg:translate-x-0">
              {profile.photoBadge}
            </div>
            )}
          </div>
        </motion.div>
      </div>

      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-faint hover:text-ink md:block"
      >
        <span className="flex h-9 w-5.5 justify-center rounded-full border border-current pt-2">
          <span className="animate-bob h-1.5 w-0.5 rounded-full bg-current" />
        </span>
      </a>
    </section>
  );
}
