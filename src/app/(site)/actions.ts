"use server";

import { z } from "zod";
import { clientIp } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { mailConfigured, sendContactMail } from "@/lib/mail";

export type ContactResult =
  | { ok: true }
  | { ok: false; error: string; fields?: Partial<Record<"name" | "email" | "message", string>> };

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100, "That name is too long."),
  email: z.string().trim().max(200, "That email address is too long.").email("Please enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(10, "Please write at least a short message.")
    .max(5000, "Please keep the message under 5,000 characters."),
});

// At most 3 messages per 10 minutes per visitor address, to keep bots from flooding the inbox.
const LIMIT = 3;
const WINDOW_MS = 10 * 60 * 1000;
const sent = new Map<string, number[]>();

function allowed(ip: string): boolean {
  const now = Date.now();
  const recent = (sent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    sent.set(ip, recent);
    return false;
  }
  recent.push(now);
  sent.set(ip, recent);
  return true;
}

export async function sendContact(form: FormData): Promise<ContactResult> {
  // Hidden field that people never see or fill in. Bots do, so pretend it worked and send nothing.
  if (String(form.get("website") ?? "")) return { ok: true };

  const parsed = contactSchema.safeParse({
    name: form.get("name"),
    email: form.get("email"),
    message: form.get("message"),
  });
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Please check the highlighted fields.", fields };
  }

  const { profile } = await getContent();
  const to = process.env.CONTACT_TO || profile.email;
  if (!mailConfigured() || !to) {
    return { ok: false, error: "The form is not set up to send yet. Please email me directly." };
  }

  if (!allowed(await clientIp())) {
    return { ok: false, error: "You have sent several messages already. Please try again in a few minutes." };
  }

  try {
    await sendContactMail({ ...parsed.data, to });
    return { ok: true };
  } catch (e) {
    console.error("[contact] sending failed:", e instanceof Error ? e.message : e);
    return { ok: false, error: "The message could not be sent. Please try again, or email me directly." };
  }
}
