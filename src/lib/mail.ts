import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/** The contact form sends email when these are set; otherwise it falls back to the visitor's email app. */
export const mailConfigured = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const store = globalThis as typeof globalThis & { __portfolioMailer?: Transporter };

function transporter(): Transporter {
  const port = Number(process.env.SMTP_PORT) || 465;
  store.__portfolioMailer ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 is TLS from the start; 587 upgrades with STARTTLS
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return store.__portfolioMailer;
}

/** Strips line breaks so user input can never add extra email headers. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

export async function sendContactMail(input: { name: string; email: string; message: string; to: string }) {
  const name = oneLine(input.name);
  const email = oneLine(input.email);

  await transporter().sendMail({
    // Sent from the authenticated mailbox so it passes spam checks; replying goes to the visitor.
    from: { name: `${name} via portfolio`, address: process.env.SMTP_USER! },
    to: input.to,
    replyTo: { name, address: email },
    subject: `Portfolio enquiry from ${name}`,
    text: `${input.message}\n\n— ${name}\n${email}`,
  });
}
