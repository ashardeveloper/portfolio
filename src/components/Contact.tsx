"use client";

import { useState, type FormEvent } from "react";
import { sendContact } from "@/app/(site)/actions";
import type { Profile, SectionCopy } from "@/lib/schema";
import { ArrowRight, GitHubIcon, LinkedInIcon, MailIcon } from "./Icons";
import { Magnetic, Reveal } from "./motion";
import { SectionHeading } from "./SectionHeading";

const field =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-ink placeholder:text-faint transition-colors focus:border-cyan/60 focus:outline-none focus:ring-2 focus:ring-cyan/25 aria-[invalid=true]:border-red-400/70";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "failed"; message: string };

export function Contact({
  profile,
  section,
  canSend,
}: {
  profile: Profile;
  section: SectionCopy;
  /** True when the server can send email. Otherwise the form opens the visitor's email app. */
  canSend: boolean;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    const data = new FormData(formEl);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const message = String(data.get("message") ?? "").trim();

    const next: Record<string, string> = {};
    if (!name) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Please enter a valid email address.";
    if (message.length < 10) next.message = "Please write at least a short message.";
    setErrors(next);
    if (Object.keys(next).length) return;

    if (canSend) {
      setStatus({ kind: "sending" });
      try {
        const result = await sendContact(data);
        if (result.ok) {
          formEl.reset();
          setStatus({ kind: "sent" });
        } else {
          setErrors(result.fields ?? {});
          setStatus({ kind: "failed", message: result.error });
        }
      } catch {
        setStatus({ kind: "failed", message: "The message could not be sent. Please check your connection and try again." });
      }
      return;
    }

    // No mail server configured: compose the email in the visitor's own mail app instead.
    const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section id="contact" className="section">
      <div className="glass relative overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-14">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(50%_60%_at_0%_0%,rgb(139_92_246/0.22),transparent_70%),radial-gradient(45%_55%_at_100%_100%,rgb(34_211_238/0.16),transparent_70%)]"
        />
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading index="05" eyebrow={section.eyebrow} title={section.title} lead={section.lead} />
            <Reveal>
              {profile.availability.enabled && (
                <>
                  <p className="-mt-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1.5 text-sm font-medium text-emerald-300">
                    <span className="animate-pulse-dot size-2 rounded-full bg-emerald-400" />
                    {profile.availability.badge}
                  </p>
                  <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">{profile.availability.long}</p>
                </>
              )}

              <div className="mt-8 flex flex-col items-start gap-3">
                <Magnetic>
                  <a
                    href={`mailto:${profile.email}`}
                    className="bg-accent inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-sm font-semibold text-bg"
                  >
                    <MailIcon />
                    {profile.email}
                  </a>
                </Magnetic>
                <div className="flex flex-wrap gap-3">
                  {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-5 py-2.5 text-sm font-medium hover:border-violet/60"
                  >
                    <LinkedInIcon width={16} height={16} />
                    LinkedIn
                  </a>
                  )}
                  {profile.github && (
                  <a
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-5 py-2.5 text-sm font-medium hover:border-violet/60"
                  >
                    <GitHubIcon width={16} height={16} />
                    GitHub
                  </a>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  autoComplete="name"
                  className={field}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1.5 text-sm text-red-300">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={field}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1.5 text-sm text-red-300">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="message" className="mb-2 block text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className={`${field} resize-y`}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                />
                {errors.message && (
                  <p id="message-error" className="mt-1.5 text-sm text-red-300">
                    {errors.message}
                  </p>
                )}
              </div>
              {/* Bot trap: hidden from people and assistive technology, left empty by real visitors. */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <button
                type="submit"
                disabled={status.kind === "sending"}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-line bg-white/5 px-6 py-3.5 text-sm font-semibold transition-colors hover:border-cyan/60 hover:bg-cyan/10 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                {canSend ? (status.kind === "sending" ? "Sending…" : "Send message") : "Write email"}
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>
              {!canSend && <p className="text-xs text-faint">Opens your email app with the message filled in.</p>}
              <div aria-live="polite">
                {status.kind === "sent" && (
                  <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
                    Thanks — your message has been sent. I will reply by email.
                  </p>
                )}
                {status.kind === "failed" && (
                  <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                    {status.message}
                  </p>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
